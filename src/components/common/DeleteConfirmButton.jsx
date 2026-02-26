import React, { useState } from "react";

const DeleteConfirmButton = ({ 
  onConfirm, 
  title = "Delete Category?",
  message = "Are you sure you want to delete this category?",
  itemName = "",
  buttonText = "Delete",
  cancelText = "Cancel",
  buttonClassName = "", 
  iconClassName = "", 
  icon = null,
  showIcon = true
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img 
        src="/ic_delete_button.png" 
        alt="Delete"
        onClick={() => setOpen(true)}
        className={`cursor-pointer hover:opacity-80 transition-opacity ${iconClassName}`}
      />

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-80 p-5 rounded-xl shadow-xl animate-[scaleIn_.25s_ease] border border-blackColor"
          >
            <h3 className="font-semibold text-lg font-sans mb-2">
              {title}
            </h3>

            <p className="text-gray-500 text-sm mb-5 font-poppins">
              {message} {itemName && <span className="font-semibold">"{itemName}"</span>}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border font-poppins hover:bg-gray-100 transition"
              >
                {cancelText}
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-poppins hover:bg-red-600 transition"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteConfirmButton;