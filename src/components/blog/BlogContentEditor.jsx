import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

  const scrollYBeforeFullscreenRef = useRef(0);
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  // isFullscreen: the admin's actual intent (toggled instantly by the button).
  // fsRender: whether the fullscreen DOM (panel + backdrop) is mounted -
  // stays true a bit longer than isFullscreen on close, so the exit
  // animation has something to animate.
  // fsEntered: flips true one frame after mounting, and false immediately
  // on close - this is what the CSS transition actually keys off of.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fsRender, setFsRender] = useState(false);
  const [fsEntered, setFsEntered] = useState(false);

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

  // Drives the fullscreen enter/exit animation. On open: mount immediately
  // (fsRender) but wait two animation frames before flipping fsEntered, so
  // the browser has a chance to paint the "hidden" starting state first -
  // otherwise the transition has nothing to animate from and it just pops
  // in. On close: flip fsEntered off right away (plays the exit transition)
  // and only unmount (fsRender) after the transition's duration has
  // elapsed. The 220ms timeout should stay in sync with the CSS transition
  // duration on .bpe__editor--fullscreen / .bpe__editor-fullscreen-backdrop.
  useEffect(() => {
    const frameIds = [];
    if (isFullscreen) {
      setFsRender(true);
      frameIds.push(
        requestAnimationFrame(() => {
          frameIds.push(requestAnimationFrame(() => setFsEntered(true)));
        }),
      );
      return () => frameIds.forEach(cancelAnimationFrame);
    }
    setFsEntered(false);
    const timeoutId = setTimeout(() => setFsRender(false), 220);
    return () => clearTimeout(timeoutId);
  }, [isFullscreen]);

  // Fullscreen mode: no second editor instance is mounted - we just resize
  // the same editor's container to fill the viewport via CSS. Lock the
  // page's own scroll for as long as the fullscreen DOM is mounted
  // (including the closing animation, so the page can't jump/scroll behind
  // it mid-transition), and let Escape close it.
  useLayoutEffect(() => {
    if (!fsRender) return;
    const scrollY = scrollYBeforeFullscreenRef.current;
    const body = document.body;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
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
        <div
          className={`bpe__editor-fullscreen-backdrop ${
            fsEntered ? "bpe__editor-fullscreen-backdrop--visible" : ""
          }`}
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div
        className={`bpe__editor ${fsRender ? "bpe__editor--fullscreen" : ""} ${
          fsRender && fsEntered ? "bpe__editor--fullscreen-visible" : ""
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
                if (!isFullscreen) {
                  scrollYBeforeFullscreenRef.current = window.scrollY;
                }
                setIsFullscreen((v) => !v);
              }}
            />
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
