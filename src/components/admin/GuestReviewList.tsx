import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, Star } from 'lucide-react';
import Button from '../ui/Button';

interface GuestReview {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  review_period: string;
  profile_image_url: string;
  property_reviewed: string;
  source: string;
  created_at: string;
  country?: string;
}

const GuestReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError('Error loading reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('guest_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      setError('Error deleting review');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
        <Link to="/admin/reviews/new">
          <Button>Add New Review</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {review.profile_image_url ? (
                    <img
                      src={review.profile_image_url}
                      alt={review.reviewer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl font-bold">
                        {review.reviewer_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{review.reviewer_name}</h3>
                    {review.country && (
                      <p className="text-sm text-amber-600">{review.country}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    {review.review_period}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{review.review_text}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{review.property_reviewed}</span>
                  <span>via {review.source}</span>
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <Link
                    to={`/admin/reviews/edit/${review.id}`}
                    className="text-amber-600 hover:text-amber-900"
                  >
                    <Pencil className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestReviewList;