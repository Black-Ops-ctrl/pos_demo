import React, { useState } from "react";
import { Trash2 } from "lucide-react";

const DeleteConfirmButton = ({ onConfirm }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Delete icon */}
      <button
        onClick={() => setOpen(true)}
        className="bg-redColor text-white p-3 rounded-full flex items-center justify-center hover:scale-105 transition"
      >
        <Trash2 size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 "
          onClick={() => setOpen(false)} // close outside click
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent close when clicking modal
            className="bg-white w-80 p-5 rounded-xl shadow-xl animate-[scaleIn_.25s_ease] border border-blackColor"
          >
            <h3 className="font-semibold text-lg font-sans mb-2">
              Delete Category?
            </h3>

            <p className="text-gray-500 text-sm mb-5 font-poppins">
              Are you sure you want to delete this category?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border font-poppins"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onConfirm(); // delete here
                  setOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-poppins"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteConfirmButton;
