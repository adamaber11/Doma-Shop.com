
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, runTransaction, doc, getDocs } from 'firebase/firestore';
import type { Review, Product } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import StarRatingInput from './StarRatingInput';

const reviewSchema = z.object({
  rating: z.number().min(1, 'التقييم مطلوب').max(5),
  comment: z.string().min(10, 'التعليق يجب أن يكون 10 أحرف على الأقل').max(500),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function Reviews({ productId }: { productId: string }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const reviewsQuery = useMemoFirebase(
    () => (firestore && productId ? query(collection(firestore, `products/${productId}/reviews`), orderBy('createdAt', 'desc')) : null),
    [firestore, productId]
  );
  const { data: reviews, isLoading, forceUpdate } = useCollection<Review>(reviewsQuery);
  const [hasUserReviewed, setHasUserReviewed] = useState<boolean | null>(null);

  useEffect(() => {
    if (reviews && user) {
      setHasUserReviewed(reviews.some(review => review.userId === user.uid));
    } else if (!user) {
      setHasUserReviewed(null);
    }
  }, [reviews, user]);


  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  async function onSubmit(values: ReviewFormData) {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'يجب عليك تسجيل الدخول أولاً' });
      return;
    }
    if (hasUserReviewed) {
      toast({ variant: 'destructive', title: 'لقد قمت بتقييم هذا المنتج بالفعل' });
      return;
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const productRef = doc(firestore, 'products', productId);
            const reviewRef = doc(collection(firestore, `products/${productId}/reviews`));

            // 1. Add the new review
            transaction.set(reviewRef, {
                ...values,
                userId: user.uid,
                userName: user.displayName || 'مستخدم مجهول',
                createdAt: serverTimestamp(),
            });

            // 2. Recalculate the average rating
            const reviewsSnapshot = await getDocs(collection(firestore, `products/${productId}/reviews`));
            const existingReviews = reviewsSnapshot.docs.map(d => d.data() as Review);

            const allRatings = [...existingReviews.map(r => r.rating), values.rating];
            const totalReviews = allRatings.length;
            const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews;
            
            // 3. Update the product document
            transaction.update(productRef, {
                rating: parseFloat(averageRating.toFixed(1)),
                reviewSummary: {
                    totalReviews: totalReviews,
                    averageRating: parseFloat(averageRating.toFixed(1)),
                }
            });
        });

        toast({ title: 'شكرًا لك!', description: 'تمت إضافة تقييمك بنجاح.' });
        form.reset();
        forceUpdate(); // Manually trigger a refetch of the reviews
    } catch (error) {
        console.error("Error submitting review:", error);
        toast({ variant: 'destructive', title: 'حدث خطأ ما', description: 'لم نتمكن من حفظ تقييمك.' });
    }
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>التقييمات والتعليقات</CardTitle>
          <CardDescription>ماذا يقول العملاء عن هذا المنتج.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p>جاري تحميل التقييمات...</p>
          ) : reviews && reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{review.userName}</h4>
                    <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt.toDate()).toLocaleDateString('ar-AE')}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">لا توجد تقييمات لهذا المنتج حتى الآن. كن أول من يقيمه!</p>
          )}
        </CardContent>
      </Card>

      {user && !hasUserReviewed && (
        <Card>
          <CardHeader>
            <CardTitle>أضف تقييمك</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تقييمك</FormLabel>
                      <FormControl>
                        <StarRatingInput
                          rating={field.value}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تعليقك</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ما رأيك في المنتج؟" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isUserLoading ? null : !user ? (
        <p className='text-center text-muted-foreground'>يجب عليك <a href='/login' className='underline text-primary'>تسجيل الدخول</a> لإضافة تقييم.</p>
      ) : hasUserReviewed ? (
        <p className='text-center text-muted-foreground'>لقد قمت بتقييم هذا المنتج بالفعل.</p>
      ) : null}
    </div>
  );
}
