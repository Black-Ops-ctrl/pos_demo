/* eslint-disable react-hooks/set-state-in-effect */
import DeleteConfirmButton from "../components/common/DeleteConfirmButton";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddProductPage from "../pages/AddProductPage"; 

const CreateCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false); // added state
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("categories");
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  /* ---------------- CREATE CATEGORY ---------------- */
  const handleCreate = () => {
    if (!name.trim()) return;

    const newCategory = {
      id: Date.now(),
      name,
      image,
      products: 0,
    };

    setCategories([...categories, newCategory]);

    setName("");
    setImage(null);
    setOpen(false);
  };

  /* ---------------- DELETE CATEGORY ---------------- */
  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold font-sans">All Categories</h2>
          <p className="text-greyColor font-sans text-sm mt-1">
            Select a category to view its products or add a new product.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-5 py-2 rounded-full font-poppins"
          >
            <Plus size={16} />
            Create Category
          </button>
          <button
            onClick={() => setOpenProductModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white px-5 py-2 rounded-full font-poppins"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* ================= GRID ================= */}
      {categories.length === 0 ? (
        <p className="text-center text-lg font-sans">No categories added.</p>
      ) : (
        <div className="grid md:grid-cols-6 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-lightGreyColor px-4 py-4 rounded-xl shadow flex flex-col items-center border border-purple-500"
            >
              {/* Image */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt=""
                  className="w-32 h-32 object-cover rounded-xl mb-3"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 border border-blackColor mb-3 flex items-center rounded-xl justify-center text-gray-500 font-poppins">
                  No Image <br /> Uploaded
                </div>
              )}

              {/* Name */}
              <h3 className="font-sans font-semibold">{cat.name}</h3>

              {/* Count */}
              <p className="text-gray-500 text-base mb-4 font-poppins">
                {cat.products} Products
              </p>

              {/* Buttons */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => navigate(`/view-products/${cat.name}`)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 text-primary py-2 rounded-full font-poppins"
                >
                  View Products
                </button>
                <DeleteConfirmButton onConfirm={() => handleDelete(cat.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl p-6 shadow-xl border border-blackColor">
            <h3 className="text-md font-semibold mb-4 font-sans">
              Create New Category
            </h3>

            {/* Name */}
            <input
              type="text"
              placeholder="Enter category name"
              className="w-full border border-blackColor rounded-lg p-2 mb-4 font-poppins"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Image picker */}
            <label className="block mb-4 cursor-pointer font-poppins">
              <span className="text-sm text-greyColor font-sans">
                Category Image
              </span>
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) =>
                  setImage(URL.createObjectURL(e.target.files[0]))
                }
              />
            </label>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border-2 rounded-lg shadow font-poppins"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-lg shadow border font-poppins"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCT MODAL ================= */}
      {openProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl p-6 shadow-xl overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold font-sans">Add Product</h2>
              <button
                className="text-gray-500 hover:text-gray-700 font-bold"
                onClick={() => setOpenProductModal(false)}
              >
                ✕
              </button>
            </div>
            <AddProductPage />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCategoryPage;
