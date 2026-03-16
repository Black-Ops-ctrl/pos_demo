import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShoppingCart, CreditCard, Banknote, Smartphone, Printer, Pause, Play } from 'lucide-react';
import { getItems } from '@/api/itemsApi';
import { createPOS } from '@/api/posApi';  
import { toast, useToast } from "@/hooks/use-toast";


interface CartItem {
  item_id: number;
  item_name: string;
  price: number;
  qty: number;
  discount: number;
  total: number;
}
interface Item {
  item_id: number;
  item_code: string;
  item_name: string;
  description: string;
  unit: string;
  price: number;
  category_id?: number;
  category_name?: string;
  warehouse_id?: number;
  warehouse_name?: string;
}

const POSSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTransactionHeld, setIsTransactionHeld] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false); // 🔹 loader
  const [message, setMessage] = useState<string | null>(null); // 🔹 status message
 // const [discount, setDiscount] = useState(0);

  // Load Items
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    }
  };

  const filteredProducts = items.filter(Item =>
    Item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (prod: Item) => {
    const price = Number(prod.price) || 0;
    setCart(prev => {
      const existing = prev.find(it => it.item_id === prod.item_id);
      if (existing) {
        return prev.map(it =>
          it.item_id === prod.item_id
            ? {
                ...it,
                qty: it.qty + 1,
                total: Number(((it.price - it.discount) * (it.qty + 1)).toFixed(2))
              }
            : it
        );
      }
      return [
        ...prev,
        {
          item_id: prod.item_id,
          item_name: prod.item_name,
          price,
          qty: 1,
          discount: 0,
          total: Number(price.toFixed(2))
        }
      ];
    });
  };



  const removeFromCart = (id: number) => {
  setCart(prev => prev.filter(it => it.item_id !== id));
};


  const updateQuantity = (id: number, newQty: number) => {
    const qty = Number(newQty) || 0;
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(it =>
        it.item_id === id
          ? { ...it, qty, total: Number(((it.price - it.discount) * qty).toFixed(2)) }
          : it
      )
    );
  };

const updateDiscount = (id: number, newDiscount: number) => {
    const discount = Number(newDiscount) || 0;
    setCart(prev =>
      prev.map(it =>
        it.item_id === id
          ? { ...it, discount, total: Number(((it.price - discount) * it.qty).toFixed(2)) }
          : it
      )
    );
  };

  
  const total_discount = cart.reduce((sum, it) => sum + Number((it.discount * it.qty).toFixed(2)), 0);
const subtotal = cart.reduce((sum, it) => sum + Number((it.price * it.qty - total_discount).toFixed(2)), 0);
  const taxableAmount = subtotal - total_discount;
  const total_tax = Number((taxableAmount * 0.10).toFixed(2));
  const total = Number((taxableAmount + total_tax).toFixed(2));
  const holdTransaction = () => {
    setIsTransactionHeld(true);
    setCart([]);
  };

  const resumeTransaction = () => {
    setIsTransactionHeld(false);
  };

  // 🔹 New: Save to DB via API
  const processPayment = async (method: string) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    try {
      setLoading(true);
      setMessage(null);

      const payloadItems = cart.map(item => ({
        item_id: item.item_id,
        qty: item.qty,
        unit_price: item.price,
        discount: item.discount,
        tax: 0,
      }));

      const res = await createPOS(
        method,          // payment_method
        total_discount,  // total_discount
        total_tax,       // total_tax
        total,           // total_amount
        1,               // created_by (hardcoded, replace with logged user id)
        payloadItems     // items JSON
      );
      toast({ title: "Created", description: "Sales Invoice created successfully!",duration: 3000, });

     // setMessage(` POS Invoice Created! Invoice No: ${res?.pos_invoice_no || "N/A"}`);
      setCart([]);
    } catch (error: any) {
      console.error("POS error:", error);
      setMessage(` Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Selection */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Product Selection</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((item) => (
              <Card key={item.item_id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(item)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{item.item_name}</h3>
                    <Badge variant="outline">{item.category_name}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{item.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart & Checkout */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Shopping Cart</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={holdTransaction}>
                <Pause className="h-4 w-4 mr-1" />
                Hold
              </Button>
              {isTransactionHeld && (
                <Button size="sm" variant="outline" onClick={resumeTransaction}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.item_id}>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateQuantity(item.item_id, parseInt(e.target.value))}
                              className="w-16 h-8"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>{item.price}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateDiscount(item.item_id, Number(e.target.value))}
                              className="w-16 h-8"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>{item.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>{total_tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>{total_discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button disabled={loading} onClick={() => processPayment('Cash')} className="bg-green-500 hover:bg-green-600">
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                  <Button disabled={loading} onClick={() => processPayment('Card')} className="bg-blue-500 hover:bg-blue-600">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                  <Button disabled={loading} onClick={() => processPayment('Mobile')} className="bg-purple-500 hover:bg-purple-600">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </>
            )}
          </div>
          {message && (
            <div className="mt-4 text-center font-semibold">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POSSystem;
