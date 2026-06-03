import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Loader2, Upload, X, Check, BookOpen } from 'lucide-react';
import { productsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product", otherwise product object
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Files inputs
  const [coverFile, setCoverFile] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const fetchProducts = () => {
    setLoading(true);
    productsAPI.getAll({ limit: 100 })
      .then(({ data }) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setCoverFile(null);
    setEbookFile(null);
    reset({
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      category: 'finance',
      author: '',
      pages: '',
      language: 'English',
      isFeatured: false,
      isPublished: true,
      learningPointsText: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setCoverFile(null);
    setEbookFile(null);
    
    reset({
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      author: product.author,
      pages: product.pages || '',
      language: product.language || 'English',
      isFeatured: product.isFeatured || false,
      isPublished: product.isPublished || false,
      learningPointsText: (product.learningPoints || []).join('\n')
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    // Process learning points (newline delimited)
    const learningPoints = formData.learningPointsText
      ? formData.learningPointsText.split('\n').map(p => p.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      learningPoints,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      pages: formData.pages ? Number(formData.pages) : undefined
    };

    setUploadingFiles(true);

    try {
      let productId;
      
      if (editingProduct) {
        // Edit product
        const { data } = await productsAPI.update(editingProduct._id, payload);
        productId = editingProduct._id;
        toast.success('Product details updated!');
      } else {
        // Create product
        const { data } = await productsAPI.create(payload);
        productId = data.product._id;
        toast.success('Product created!');
      }

      // Handle file uploads if present
      if (coverFile) {
        toast.loading('Uploading cover image...', { id: 'upload' });
        await productsAPI.uploadCover(productId, coverFile);
      }
      if (ebookFile) {
        toast.loading('Uploading ebook file...', { id: 'upload' });
        await productsAPI.uploadFile(productId, ebookFile);
      }

      toast.dismiss('upload');
      toast.success('All assets uploaded successfully!');
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.dismiss('upload');
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sora text-white">Manage Products</h2>
          <p className="text-sm text-gray-400">Add, edit, or remove ebook items from the store.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-555 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-550 h-8 w-8" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/10 border border-dashed border-gray-850 rounded-2xl">
          <BookOpen size={48} className="mx-auto text-gray-655 mb-4" />
          <h3 className="text-lg font-bold mb-2">No products found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            There are no products in the catalog. Click the button above to add your first ebook.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-850 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-850 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Sales</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 bg-gray-950 border border-gray-800 rounded overflow-hidden flex items-center justify-center shrink-0 relative">
                          {product.coverImage?.url ? (
                            <img src={product.coverImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={10} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate max-w-[200px] sm:max-w-[300px]">
                            {product.title}
                          </span>
                          <span className="text-xxs text-gray-500">By {product.author}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 capitalize">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-450">₹{product.price}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{product.totalSales} sales</div>
                      <div className="text-[10px] text-gray-500">₹{product.totalRevenue} rev</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                        product.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-805 text-gray-500 border border-gray-800'
                      }`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-750"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-850 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-850 flex justify-between items-center bg-gray-900/80">
              <h3 className="text-lg font-bold font-sora text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {/* Grid 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Product Title</label>
                  <input
                    {...register('title', { required: true })}
                    type="text" placeholder="e.g. The Wealth Blueprint"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Author</label>
                  <input
                    {...register('author', { required: true })}
                    type="text" placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Price (₹)</label>
                  <input
                    {...register('price', { required: true })}
                    type="number" placeholder="499"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Original Price (₹)</label>
                  <input
                    {...register('originalPrice')}
                    type="number" placeholder="999"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Category</label>
                  <select
                    {...register('category', { required: true })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="finance">Finance</option>
                    <option value="business">Business</option>
                    <option value="investing">Investing</option>
                    <option value="crypto">Crypto</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="mindset">Mindset</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Grid 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Page Count</label>
                  <input
                    {...register('pages')}
                    type="number" placeholder="250"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Language</label>
                  <input
                    {...register('language')}
                    type="text" placeholder="English"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Short Description</label>
                <input
                  {...register('shortDescription')}
                  type="text" placeholder="Brief tagline shown on grids..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Detailed Description</label>
                <textarea
                  {...register('description', { required: true })}
                  rows="4" placeholder="Detailed chapter list, specifications, and outcomes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Learning points */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">
                  What you will learn (one point per line)
                </label>
                <textarea
                  {...register('learningPointsText')}
                  rows="3" placeholder="Point 1&#10;Point 2&#10;Point 3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono text-xs"
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-850 pt-5">
                {/* Cover upload */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Cover Image</label>
                  <div className="relative border border-dashed border-gray-700 rounded-lg hover:bg-gray-800 transition-colors p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer">
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-300">
                      {coverFile ? coverFile.name : 'Upload cover file'}
                    </span>
                    <span className="text-[10px] text-gray-500">PNG, JPG up to 5MB</span>
                  </div>
                </div>

                {/* Ebook file upload */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Ebook Document</label>
                  <div className="relative border border-dashed border-gray-700 rounded-lg hover:bg-gray-800 transition-colors p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer">
                    <input
                      type="file" accept=".pdf,.epub"
                      onChange={(e) => setEbookFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-300">
                      {ebookFile ? ebookFile.name : 'Upload PDF/EPUB file'}
                    </span>
                    <span className="text-[10px] text-gray-500">PDF or EPUB up to 25MB</span>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 border-t border-gray-850 pt-4 text-xs font-semibold">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    {...register('isFeatured')}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-500 bg-gray-800"
                  />
                  Featured Product
                </label>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-500 bg-gray-800"
                  />
                  Publish Immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-850 bg-gray-900/80">
                <button
                  type="button" onClick={() => setModalOpen(false)}
                  className="bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFiles}
                  className="bg-emerald-600 hover:bg-emerald-555 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950"
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
