
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { ContactMessage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Eye, Mail, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function MessageDetailsDialog({
  message,
  onClose,
  onMarkAsRead,
}: {
  message: ContactMessage | null;
  onClose: () => void;
  onMarkAsRead: (messageId: string) => void;
}) {
  const isOpen = !!message;

  if (!message) return null;

  const handleOpen = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleMarkAsReadClick = () => {
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={handleMarkAsReadClick}>
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            من: {message.name} &lt;{message.email}&gt;
            <br />
            بتاريخ: {message.createdAt ? new Date(message.createdAt.toDate()).toLocaleString('ar-AE') : 'غير متوفر'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 whitespace-pre-wrap bg-muted/50 p-4 rounded-md border text-sm">
            {message.message}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardMessagesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const messagesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );
  const { data: fetchedMessages, isLoading } = useCollection<ContactMessage>(messagesQuery);

  // Sync state with fetched data
  useState(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);


  const handleMarkAsRead = async (messageId: string) => {
    if (!firestore) return;
    try {
      const messageRef = doc(firestore, 'contactMessages', messageId);
      await updateDoc(messageRef, { isRead: true });
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isRead: true } : m)));
      toast({ title: 'تم تحديد الرسالة كمقروءة' });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      toast({ variant: 'destructive', title: 'فشل تحديث الرسالة' });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-headline font-bold mb-8">رسائل العملاء</h1>
      <Card>
        <CardHeader>
          <CardTitle>صندوق الوارد</CardTitle>
          <CardDescription>عرض وإدارة جميع الرسائل الواردة من العملاء.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحالة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الموضوع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : fetchedMessages && fetchedMessages.length > 0 ? (
                fetchedMessages.map((message) => (
                  <TableRow key={message.id} className={cn(!message.isRead && 'bg-primary/5 hover:bg-primary/10')}>
                    <TableCell>
                      {!message.isRead ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                           <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                           </span>
                           جديد
                        </Badge>
                      ) : (
                        <Badge variant="secondary">مقروء</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>
                      {message.createdAt
                        ? new Date(message.createdAt.toDate()).toLocaleDateString('ar-AE')
                        : 'غير متوفر'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(message)}>
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    لا توجد رسائل واردة حاليًا.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MessageDetailsDialog
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
