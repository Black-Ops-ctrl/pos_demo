import React, { useState } from "react";
import editIcon from '../assets/png/ic_edit_button.png';
import deleteIcon from '../assets/png/ic_delete_button.png';

const ViewProduct = () => {
  const products = [
    {
      id: 1,
      name: "Sports Jacket",
      category: "Sportswear",
      barcode: "tsh-blu-med",
      status: "In Stock",
      quantity: 120,
      reorder: 180,
      price: 120.5,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 2,
      name: "Gray Backpack",
      category: "Accessories",
      barcode: "gb-nblu-sma",
      status: "In Stock",
      quantity: 170,
      reorder: 130,
      price: 105.55,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 3,
      name: "Blaze Sneakers",
      category: "Footwear",
      barcode: "ftw-gr-big",
      status: "Stock Out",
      quantity: 0,
      reorder: 300,
      price: 175.43,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 4,
      name: "Leather Tote Bag",
      category: "Lifestyle",
      barcode: "ltb-gry-sma",
      status: "Low Stock",
      quantity: 103,
      reorder: 197,
      price: 130.44,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 5,
      name: "Leather Jacket",
      category: "Apparel",
      barcode: "lj-yhw-med",
      status: "In Stock",
      quantity: 270,
      reorder: 30,
      price: 182.01,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 6,
      name: "Black T-shirt",
      category: "Apparel",
      barcode: "ts-bts-big",
      status: "Low Stock",
      quantity: 80,
      reorder: 220,
      price: 96.84,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 7,
      name: "Black Boots",
      category: "Footwear",
      barcode: "bbf-blk-sma",
      status: "Stock Out",
      quantity: 0,
      reorder: 300,
      price: 106.27,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 8,
      name: "Men Short Pants",
      category: "Sportswear",
      barcode: "msp-gry-med",
      status: "In Stock",
      quantity: 180,
      reorder: 120,
      price: 228.41,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 9,
      name: "Red Cap",
      category: "Accessories",
      barcode: "rc-red-sma",
      status: "In Stock",
      quantity: 200,
      reorder: 100,
      price: 45.5,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 10,
      name: "Running Shoes",
      category: "Footwear",
      barcode: "rs-blu-med",
      status: "Low Stock",
      quantity: 50,
      reorder: 150,
      price: 150.0,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
    {
      id: 11,
      name: "Running Shoes",
      category: "Footwear",
      barcode: "rs-blu-med",
      status: "Low Stock",
      quantity: 50,
      reorder: 150,
      price: 150.0,
      image: "https://image2url.com/r2/default/images/1770892148842-0bb17e3d-a005-4db0-8e46-458054e066b2.webp",
    },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Function to limit words in product name
  const limitWords = (str, limit) => {
    if (str.length <= limit) return str;
    return str.slice(0, limit) + "...";
  };

  // Open the modal for editing
  const handleEditClick = (product) => {
    setSelectedProduct({ ...product });
    setModalOpen(true);
  };

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Handle image change in the modal
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prevProduct) => ({
          ...prevProduct,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the updated product
  const handleSaveClick = () => {
    setProductsList((prevProducts) =>
      prevProducts.map((product) =>
        product.id === selectedProduct.id ? selectedProduct : product
      )
    );
    setModalOpen(false);
    setSelectedProduct(null);
  };

  // Cancel the edit
  const handleCancelClick = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Apply search and filters
  const displayedProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalStockValue = displayedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const totalProducts = displayedProducts.length;
  const lowStockCount = displayedProducts.filter((p) => p.status === "Low Stock")
    .length;
  const outOfStockCount = displayedProducts.filter(
    (p) => p.status === "Stock Out"
  ).length;

  return (
    <div className="p-6 bg-lightGreyColor font-sans">
      {/* Summary Cards */}
      <div className="flex gap-6 font-poppins mb-6">
        <div className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg font-semibold mb-1">
            Total Stock Value
          </span>
          <span className="text-lg font-semibold font-sans">
            Rs{" "}
            {totalStockValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-pink-500 to-red-300 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg mb-1 font-semibold">
            Total Products
          </span>
          <span className="text-lg font-semibold font-sans">{totalProducts}</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-amber-500 to-orange-300 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg mb-1 font-semibold">
            Low Stock Products
          </span>
          <span className="text-lg font-semibold font-sans">{lowStockCount}</span>
        </div>
        <div className="flex-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-200 p-4 rounded-xl border shadow-md flex flex-col">
          <span className="text-primary font-sans text-lg mb-1 font-semibold">
            Out of Stock Products
          </span>
          <span className="text-lg font-semibold font-sans">{outOfStockCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between mb-4">
        <input
          type="search"
          placeholder="Search Product..."
          className="rounded-full item-center px-3 py-2 w-1/3 border border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center">
          <select
            className="border shadow rounded-full px-2 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-primary font-poppins"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {["All Status", "In Stock", "Low Stock", "Stock Out"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl shadow border bg-white">
        <table className="w-full text-center text-md font-poppins">
          <thead className="bg-gray-300 border-b">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Barcode</th>
              <th className="p-3">Stock Status</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Price</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No products found.
                </td>
              </tr>
            ) : (
              displayedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-lightGreyColor">
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 flex flex-col items-center gap-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover border shadow rounded-md"
                    />
                    <span>{limitWords(product.name, 16)}</span>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.barcode}</td>
                  <td className="p-3">
                    <span
                      className={`px-4 py-2 rounded-full text-md font-light-bold ${
                        product.status === "In Stock"
                          ? "bg-green-100 text-green-700"
                          : product.status === "Low Stock"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3">{product.quantity} pcs</td>
                  <td className="p-3">Rs {product.price.toFixed(2)}</td>
                  <td className="justify-center items-center gap-4">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2"
                    >
                      <img
                        src={editIcon}
                        alt="Edit"
                        className="w-7 h-7 object-cover"
                      />
                    </button>
                    <button className="p-2">
                      <img
                        src={deleteIcon}
                        alt="Delete"
                        className="w-7 h-7 object-cover"
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
{modalOpen && selectedProduct && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
    <div className="bg-primary p-8 rounded-xl shadow-xl w-auto">
      <h2 className="text-xl font-semibold text-secondary font-poppins mb-4 text-start">Edit Product</h2>
      {/* Modal Form */}
      <div className="space-y-6">
        {/* Product Name Input */}
        <div className="mb-4">
          <label className="block text-secondary mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={selectedProduct.name}
            onChange={handleInputChange}
            className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins" 
          />
        </div>

        {/* Barcode Input */}
        <div className="mb-4">
          <label className="block text-secondary mb-2">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={selectedProduct.barcode}
            onChange={handleInputChange}
            className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
          />
        </div>

        {/* Price Input */}
        <div className="mb-4">
          <label className="block text-secondary mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={selectedProduct.price}
            onChange={handleInputChange}
            className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
          />
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-secondary mb-2">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={selectedProduct.quantity}
            onChange={handleInputChange}
            className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-secondary mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-500 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-poppins"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 border-2 rounded-lg shadow font-poppins"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-lg shadow border font-poppins"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
  );
};

export default ViewProduct;
