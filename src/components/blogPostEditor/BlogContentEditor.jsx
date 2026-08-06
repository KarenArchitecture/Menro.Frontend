import { useEffect, useRef, useState } from "react";

// tiptap editor imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Details,
  DetailsSummary,
  DetailsContent,
} from "@tiptap/extension-details";
import Image from "@tiptap/extension-image";

// components
import RestaurantCardNode from "./RestaurantCardNode";
import RestaurantSearchModal from "./RestaurantSearchModal";
import { useGlobalUI } from "../common/GlobalUI";

// api and styles
import {
  getBlogPostContent,
  updateBlogPostContent,
  uploadBlogContentImage,
} from "../../api/adminBlogs";
import "../../assets/css/admin/blogContentEditor.css";

// How long to wait after the last keystroke before autosaving.
const AUTOSAVE_DELAY_MS = 5000;

// Keys that would otherwise scroll the page while the background is
// supposed to be locked behind the fullscreen editor.
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  icon,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`bpe__editor-btn ${active ? "bpe__editor-btn--active" : ""} ${className}`}
      onMouseDown={(e) => e.preventDefault()} // don't steal focus from the editor
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <i className={icon} />
    </button>
  );
}

export default function BlogContentEditor({ postId }) {
  const { notify } = useGlobalUI();
  const [loading, setLoading] = useState(true);
  // idle | saving | saved | error
  const [saveStatus, setSaveStatus] = useState("idle");

  // Tracks the HTML we last successfully saved, so we never send a duplicate
  // save for content that hasn't actually changed (e.g. right after the
  // initial load calls setContent()).
  const lastSavedHtml = useRef(null);
  const saveTimeoutRef = useRef(null);
  // Concurrency guard: if a save is already in flight when the debounce
  // timer fires again, we don't start a second overlapping request (which
  // could resolve out of order and let an older save overwrite a newer
  // one). Instead we remember the latest pending HTML and, once the
  // in-flight request finishes, immediately save that latest version.
  const isSavingRef = useRef(false);
  const pendingHtmlRef = useRef(null);

  // image upload in editor
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  // The panel's own DOM node (the .bpe__editor div). Used to (a) measure its
  // height right before it goes fullscreen, so the placeholder left behind
  // can reserve exactly that much space, and (b) tell, in the scroll-lock
  // effect below, whether a given event happened inside the panel (allowed)
  // or on the dimmed background behind it (blocked).
  const editorRef = useRef(null);
  const capturedHeightRef = useRef(null);

  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  // isFullscreen: the admin's actual intent (toggled instantly by the button).
  // fsRender: whether the fullscreen DOM (panel + backdrop + placeholder) is
  // mounted - stays true a bit longer than isFullscreen on close, so the
  // exit animation has something to play against before unmounting.
  // exiting: true only during that closing window - swaps in the
  // "...-exiting" keyframe class (see blogContentEditor.css). Entering
  // doesn't need an equivalent flag: applying .bpe__editor--fullscreen
  // itself carries a plain CSS `animation`, which auto-plays from its own
  // "from" keyframe every time the class is (re)applied - no JS timing
  // dance required, unlike a `transition` (which only animates a change
  // from something already painted, hence needing the entering flag +
  // double-rAF this used to have).
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsRender, setFsRender] = useState(false);
  const [exiting, setExiting] = useState(false);
  const hasOpenedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "نوشتن محتوای پست را از اینجا شروع کنید...",
      }),
      Image.configure({
        HTMLAttributes: { class: "bpe__editor-img" },
      }),
      RestaurantCardNode,
      Details.configure({
        persist: true,
        HTMLAttributes: { class: "bpe__details" },
      }),
      DetailsSummary,
      DetailsContent,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      scheduleAutosave(editor.getHTML());
    },
  });

  // Load the existing content once, then push it into the editor without
  // treating it as a user edit (the `false` below skips onUpdate/history).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getBlogPostContent(postId);
        if (!cancelled && editor) {
          editor.commands.setContent(data.content || "", false);
          lastSavedHtml.current = data.content || "";
        }
      } catch (err) {
        if (!cancelled) {
          notify({
            type: "error",
            message: apiErrorMessage(
              err,
              "بارگذاری محتوای پست با خطا مواجه شد.",
            ),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, editor]);

  const scheduleAutosave = (html) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => save(html), AUTOSAVE_DELAY_MS);
  };

  // Lets the admin force an immediate save (e.g. right before navigating
  // away) instead of waiting out the 5s autosave delay. Cancels any pending
  // debounced save first so we don't end up double-saving right after.
  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (editor) save(editor.getHTML());
  };

  const save = async (html) => {
    if (html === lastSavedHtml.current) return; // nothing actually changed
    if (isSavingRef.current) {
      // A save is already in flight - don't fire a second overlapping
      // request. Just remember this as the latest version to send once
      // the current one finishes.
      pendingHtmlRef.current = html;
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");
    try {
      await updateBlogPostContent(postId, html);
      lastSavedHtml.current = html;
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره‌ی محتوا با خطا مواجه شد."),
      });
    } finally {
      isSavingRef.current = false;
      // If newer content piled up while we were saving, send it now.
      if (
        pendingHtmlRef.current !== null &&
        pendingHtmlRef.current !== lastSavedHtml.current
      ) {
        const next = pendingHtmlRef.current;
        pendingHtmlRef.current = null;
        save(next);
      }
    }
  };

  // Flush any pending autosave on unmount (e.g. admin navigates away right
  // after typing, before the debounce timer fires).
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (editor) save(editor.getHTML());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drives the fullscreen mount/unmount lifecycle. Entering needs no special
  // handling here - mounting with .bpe__editor--fullscreen present is enough
  // for its own CSS animation to play (see the class comment above). Exiting
  // needs to stay mounted for the exit animation's duration before actually
  // unmounting, so fsRender is only flipped off after that delay. The 220ms
  // timeout should stay in sync with the CSS animation duration on
  // .bpe__editor--fullscreen-exiting / .bpe__editor-fullscreen-backdrop--exiting.
  useEffect(() => {
    if (isFullscreen) {
      hasOpenedRef.current = true;
      setExiting(false);
      setFsRender(true);
      return;
    }
    if (!hasOpenedRef.current) return; // never opened - nothing to close
    setExiting(true);
    const timeoutId = setTimeout(() => {
      setFsRender(false);
      setExiting(false);
    }, 220);
    return () => clearTimeout(timeoutId);
  }, [isFullscreen]);

  // Blocks the page behind the fullscreen editor from scrolling, while the
  // fullscreen DOM is mounted (including the closing animation). This is
  // deliberately NOT done via the usual `body.style.position = "fixed"`
  // trick: that trick makes the real document scroll offset become 0 (it
  // fakes the scroll visually with a negative `top` instead), and
  // position:sticky is computed from that real offset. With it at 0, any
  // sticky element on the page (the sidebar next to this editor) gets
  // treated as "unstuck" and snaps to its plain in-flow position - which,
  // combined with the page being visually shifted up by the old scroll
  // amount, is exactly the jump this component used to cause. Blocking the
  // underlying wheel/touch/key events instead leaves the real scroll
  // position - and therefore the sidebar's sticky offset - completely
  // untouched, so there's nothing for it to jump for.
  useEffect(() => {
    if (!fsRender) return;

    const isInsidePanel = (node) =>
      !!editorRef.current && !!node && editorRef.current.contains(node);

    const blockScroll = (e) => {
      if (!isInsidePanel(e.target)) e.preventDefault();
    };
    const blockKeyScroll = (e) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
        return;
      }
      if (SCROLL_KEYS.has(e.key) && !isInsidePanel(document.activeElement)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeyScroll);
    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeyScroll);
    };
  }, [fsRender]);

  // Opens the native file picker (hidden <input type="file"> below).
  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  // Inserts a local preview immediately (so the admin gets instant visual
  // feedback), uploads the file in the background, then swaps the preview's
  // src for the real, permanent URL once the upload finishes. If the upload
  // fails, the local-preview node is removed instead of leaving a
  // dead/blob-url image stuck in the content.
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow selecting the same file again later
    if (!file || !editor) return;

    const localPreviewUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: localPreviewUrl }).run();

    setUploadingImage(true);
    try {
      const { url } = await uploadBlogContentImage(postId, file);
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === localPreviewUrl) {
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { src: url })
            .run();
          return false;
        }
      });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "آپلود تصویر با خطا مواجه شد."),
      });
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === localPreviewUrl) {
          editor.chain().setNodeSelection(pos).deleteSelection().run();
          return false;
        }
      });
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingImage(false);
    }
  };

  if (!editor) return null;

  return (
    <>
      {fsRender && (
        // Reserves the space the panel would normally occupy in the main
        // column, sized to whatever it measured right before switching to
        // fullscreen (see the toggle button below). Without this, the panel
        // going position:fixed removes its height from the flow, the main
        // column (and the sticky sidebar's container next to it) suddenly
        // shrinks, and the sidebar's sticky offset gets recalculated against
        // a different container height on top of the issue described above.
        <div
          className="bpe__editor-slot-placeholder"
          style={
            capturedHeightRef.current
              ? { height: `${capturedHeightRef.current}px` }
              : undefined
          }
          aria-hidden="true"
        />
      )}
      {fsRender && (
        <div
          className={`bpe__editor-fullscreen-backdrop ${
            exiting ? "bpe__editor-fullscreen-backdrop--exiting" : ""
          }`}
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div
        ref={editorRef}
        className={`bpe__editor ${fsRender ? "bpe__editor--fullscreen" : ""} ${
          exiting ? "bpe__editor--fullscreen-exiting" : ""
        }`}
      >
        <div className="bpe__editor-toolbar">
          <div className="bpe__editor-toolbar-group bpe__editor-toolbar-group--start">
            <ToolbarButton
              icon="fas fa-bold"
              title="ضخیم"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              icon="fas fa-italic"
              title="مورب"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              icon="fas fa-strikethrough"
              title="خط‌خورده"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <span className="bpe__editor-sep" />
            <ToolbarButton
              icon="fas fa-heading"
              title="تیتر بزرگ"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <ToolbarButton
              icon="fas fa-heading fa-sm"
              title="تیتر کوچک"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            />
            <span className="bpe__editor-sep" />
            <ToolbarButton
              icon="fas fa-list-ul"
              title="لیست نشانه‌دار"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              icon="fas fa-list-ol"
              title="لیست شماره‌دار"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              icon="fas fa-quote-right"
              title="نقل قول"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton
              icon="fas fa-minus"
              title="جداکننده"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />
            <span className="bpe__editor-sep" />
            <ToolbarButton
              icon="fas fa-rotate-left"
              title="واگرد"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            />
            <ToolbarButton
              icon="fas fa-rotate-right"
              title="ازنو"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            />
            <ToolbarButton
              icon="fas fa-square-caret-down"
              title="افزودن بخش بازشو (سؤال/جواب)"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: "details",
                    attrs: { open: true },
                    content: [
                      {
                        type: "detailsSummary",
                        content: [
                          { type: "text", text: "سؤال را اینجا بنویسید" },
                        ],
                      },
                      {
                        type: "detailsContent",
                        content: [
                          {
                            type: "paragraph",
                            content: [
                              { type: "text", text: "پاسخ را اینجا بنویسید" },
                            ],
                          },
                        ],
                      },
                    ],
                  })
                  .run()
              }
            />
            <ToolbarButton
              icon="fas fa-utensils"
              title="افزودن رستوران"
              onClick={() => setRestaurantModalOpen(true)}
            />
            <ToolbarButton
              icon={`fas ${uploadingImage ? "fa-spinner fa-spin" : "fa-image"}`}
              title="افزودن تصویر"
              disabled={uploadingImage}
              onClick={handleImageButtonClick}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFileChange}
            />
          </div>
          <div className="bpe__editor-toolbar-group bpe__editor-toolbar-group--end">
            <ToolbarButton
              icon={isFullscreen ? "fas fa-compress" : "fas fa-expand"}
              title={isFullscreen ? "خروج از حالت تمام‌صفحه" : "حالت تمام‌صفحه"}
              onClick={() => {
                if (!isFullscreen && editorRef.current) {
                  capturedHeightRef.current = editorRef.current.offsetHeight;
                }
                setIsFullscreen((v) => !v);
              }}
            />
            <span
              className={`bpe__editor-status ${
                saveStatus === "saved" ? "bpe__editor-status--saved" : ""
              } ${saveStatus === "error" ? "bpe__editor-status--error" : ""}`}
            >
              {saveStatus === "saving" && "در حال ذخیره..."}
              {saveStatus === "saved" && "ذخیره شد"}
              {saveStatus === "error" && "خطا در ذخیره"}
            </span>
            <ToolbarButton
              icon="fas fa-floppy-disk"
              title="ذخیره‌ی دستی"
              disabled={saveStatus === "saving"}
              onClick={handleManualSave}
            />
          </div>
        </div>

        {loading ? (
          <div className="bpe__editor-loading">در حال بارگذاری محتوا...</div>
        ) : (
          <EditorContent editor={editor} className="bpe__editor-body" />
        )}

        {restaurantModalOpen && (
          <RestaurantSearchModal
            onClose={() => setRestaurantModalOpen(false)}
            onSelect={(restaurant) => {
              editor.chain().focus().insertRestaurantCard(restaurant).run();
              setRestaurantModalOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
}
