import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Globe, FileText, CheckCircle2, MessageSquare, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { productsAPI } from '../services/api';
import useCartStore from '../context/useCartStore';
import useAuthStore from '../context/useAuthStore';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const hasItem = useCartStore(s => s.hasItem);

  const fetchProduct = () => {
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then(({ data }) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        toast.error('Product not found.');
        navigate('/browse');
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    toast.success(`${product.title} added to cart!`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(product._id, { rating, comment });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      // Reload product data to show new review & updated average rating
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-gray-950 text-white min-h-screen">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-950 text-white min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-16">
          {/* Ebook Cover Image Column */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] aspect-[4/5] bg-gradient-to-br from-amber-950/40 to-gray-950 border border-gray-850 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-8">
              {product.coverImage?.url ? (
                <img
                  src={product.coverImage.url}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <BookOpen size={48} className="text-amber-500 mb-6" />
                  <div className="mt-auto">
                    <span className="text-xxs font-bold text-amber-450 uppercase tracking-widest mb-2 block">{product.category}</span>
                    <h2 className="text-2xl font-bold font-sora text-white leading-tight mb-2 line-clamp-3">{product.title}</h2>
                    <p className="text-xs text-gray-500">By {product.author}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-bold text-amber-450 uppercase tracking-widest mb-3 block">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-sora text-white leading-tight mb-4">{product.title}</h1>
            <p className="text-sm text-gray-405 mb-6">By <span className="text-gray-300 font-medium">{product.author}</span></p>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                    className={i < Math.round(product.rating) ? 'text-amber-500' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-200">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.numReviews} customer reviews)</span>
            </div>

            <p className="text-gray-305 text-base leading-relaxed mb-8">{product.description}</p>

            {/* Buying box */}
            <div className="bg-gray-900/50 border border-gray-850 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Price</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-bold text-white">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-505 line-through">₹{product.originalPrice}</span>
                      <span className="text-xs font-bold text-amber-450 uppercase">
                        ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={hasItem(product._id)}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  hasItem(product._id)
                    ? 'bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-550 text-white shadow-amber-950/40'
                }`}
              >
                <ShoppingCart size={18} />
                {hasItem(product._id) ? 'Already in Cart' : 'Add to Cart'}
              </button>
            </div>

            {/* Metadata specs */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-900 pt-6">
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <FileText size={16} className="text-amber-450" />
                <div>
                  <span className="block text-gray-550">Format</span>
                  <span className="font-semibold text-gray-300 uppercase">{product.file?.format || 'PDF'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <BookOpen size={16} className="text-amber-450" />
                <div>
                  <span className="block text-gray-550">Pages</span>
                  <span className="font-semibold text-gray-300">{product.pages || 'N/A'} pages</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <Globe size={16} className="text-amber-450" />
                <div>
                  <span className="block text-gray-550">Language</span>
                  <span className="font-semibold text-gray-300">{product.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What you'll learn */}
        {product.learningPoints && product.learningPoints.length > 0 && (
          <div className="bg-gray-900/20 border border-gray-850 p-8 rounded-2xl mb-16">
            <h3 className="text-xl font-bold font-sora text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-amber-500" /> What You'll Learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.learningPoints.map((point, index) => (
                <div key={index} className="flex gap-3 items-start text-sm text-gray-300 leading-relaxed">
                  <span className="h-5 w-5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-450 font-bold shrink-0 text-xs mt-0.5">
                    ✓
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t border-gray-900 pt-12">
          <h3 className="text-2xl font-bold font-sora text-white mb-8 flex items-center gap-2.5">
            <MessageSquare className="text-amber-500" /> Customer Reviews ({product.numReviews})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Reviews list */}
            <div className="md:col-span-7 space-y-6">
              {product.reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet for this ebook. Be the first to review!</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev._id} className="bg-gray-900/30 border border-gray-850 p-6 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{rev.name}</h4>
                        <span className="text-xxs text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? 'text-amber-500' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add review form */}
            <div className="md:col-span-5">
              <div className="bg-gray-900 border border-gray-850 p-6 rounded-2xl">
                <h4 className="text-lg font-bold font-sora text-white mb-4">Write a Review</h4>
                {isAuthenticated() ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Rating</label>
                      <div className="flex gap-2 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              fill={star <= rating ? 'currentColor' : 'none'}
                              className={star <= rating ? 'text-amber-500' : 'text-gray-655'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Your Review</label>
                      <textarea
                        rows="4"
                        placeholder="Share your experience reading this ebook..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-sm text-gray-400">Please sign in to write a review for this product.</p>
                    <Link
                      to="/login"
                      className="inline-block bg-gray-800 hover:bg-gray-750 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
