import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getItemCategories } from '@/api/getItemCategoriesApi';

const itemSchema = z.object({
  item_code: z.string().min(1, 'Required'),
  item_name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  price: z.coerce.number().gt(0, 'Must be > 0'),
  category_id: z.coerce.number().gt(0, 'Select a category'),
});

type ItemFormSchema = z.infer<typeof itemSchema>;

interface Item {
  item_id: number;
  item_code: string;
  item_name: string;
  description: string;
  unit: string;
  price: number;
  category_id?: number;
}

const ItemForm: React.FC<{
  item: Item | null;
  onClose: () => void;
  onSave: (data: Omit<Item, 'item_id'>) => void;
}> = ({ item, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ItemFormSchema>({
    resolver: zodResolver(itemSchema),
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getItemCategories().then(setCategories);
    if (item) {
      reset(item);
    }
  }, [item, reset]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">{item ? 'Edit' : 'Add'} Item</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
          <Input placeholder="Item Code" {...register('item_code')} />
          <p className="text-red-500 text-xs">{errors.item_code?.message}</p>

          <Input placeholder="Item Name" {...register('item_name')} />
          <p className="text-red-500 text-xs">{errors.item_name?.message}</p>

          <Input placeholder="Description" {...register('description')} />
          <p className="text-red-500 text-xs">{errors.description?.message}</p>

          <Input type="number" placeholder="Price" {...register('price')} />
          <p className="text-red-500 text-xs">{errors.price?.message}</p>

          <Input placeholder="Unit" {...register('unit')} />
          <p className="text-red-500 text-xs">{errors.unit?.message}</p>

          <select {...register('category_id')} className="w-full border p-2 rounded">
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select>
          <p className="text-red-500 text-xs">{errors.category_id?.message}</p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
