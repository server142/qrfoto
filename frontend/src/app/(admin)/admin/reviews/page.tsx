"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";
import { getApiUrl } from "@/lib/api";

export default function AdminReviewsPage() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/reviews/all`, {
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const toggleApproval = async (id: string) => {
        try {
            const res = await fetch(`${getApiUrl()}/reviews/${id}/toggle`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${getToken()}` }
            });
            if (res.ok) {
                await fetchReviews();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">{t.admin.reviews_title}</h2>
                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">{t.admin.reviews_subtitle}</p>
            </div>

            <Card className="bg-zinc-950/50 border-white/10 p-6 rounded-[2rem] shadow-2xl">
                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">User</TableHead>
                                <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">Rating</TableHead>
                                <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">Comment</TableHead>
                                <TableHead className="text-white/40 uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                                <TableHead className="text-right text-white/40 uppercase text-[10px] font-black tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id} className="border-white/5 hover:bg-white/[0.02]">
                                    <TableCell className="font-medium text-white">
                                        <p className="font-bold">{review.user?.first_name} {review.user?.last_name}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{review.user?.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white/60 text-sm max-w-[300px] truncate">
                                        {review.comment || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`uppercase text-[10px] px-2 py-0 border-0 ${review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {review.is_approved ? t.admin.approved : t.admin.hidden}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => toggleApproval(review.id)}
                                            className={`h-8 uppercase text-[10px] font-bold tracking-widest px-4 rounded-xl ${review.is_approved ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                                        >
                                            {review.is_approved ? t.admin.hide : t.admin.approve}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reviews.length === 0 && (
                                <TableRow className="border-0 hover:bg-transparent">
                                    <TableCell colSpan={5} className="text-center py-20 text-white/40 uppercase tracking-widest text-[10px] font-black italic">
                                        No reviews yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
