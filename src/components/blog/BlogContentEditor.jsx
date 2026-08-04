import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import RestaurantCardNode from "./RestaurantCardNode";
import RestaurantSearchModal from "./RestaurantSearchModal";
import {
  getBlogPostContent,
  updateBlogPostContent,
} from "../../api/adminBlogs";
import { useGlobalUI } from "../common/GlobalUI";

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

  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "نوشتن محتوای پست را از اینجا شروع کنید...",
      }),
      RestaurantCardNode,
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

  if (!editor) return null;

  return (
    <div className="bpe__editor">
      <div className="bpe__editor-toolbar">
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
          icon="fas fa-utensils"
          title="افزودن رستوران"
          onClick={() => setRestaurantModalOpen(true)}
        />
        <ToolbarButton
          icon="fas fa-floppy-disk"
          title="ذخیره‌ی دستی"
          disabled={saveStatus === "saving"}
          onClick={handleManualSave}
          className="bpe__editor-btn--save"
        />{" "}
        <span className="bpe__editor-status">
          {saveStatus === "saving" && "در حال ذخیره..."}
          {saveStatus === "saved" && "ذخیره شد"}
          {saveStatus === "error" && "خطا در ذخیره"}
        </span>
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
  );
}
