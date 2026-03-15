import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddProductPage: React.FC = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vendor/products">
          <Button variant="outline" size="icon" className="border-border/50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details to list a new product</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input placeholder="e.g. Wireless Pro Headphones" className="bg-accent/30 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe your product..." className="bg-accent/30 border-border/50 min-h-[120px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="bg-accent/30 border-border/50"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Decor</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="e.g. wireless, bluetooth" className="bg-accent/30 border-border/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-lg">Pricing & Stock</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" placeholder="0.00" className="bg-accent/30 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Compare at Price ($)</Label>
              <Input type="number" placeholder="0.00" className="bg-accent/30 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input type="number" placeholder="0" className="bg-accent/30 border-border/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-lg">Images</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Drag & drop images here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse (PNG, JPG up to 5MB)</p>
          </div>
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-20 rounded-lg glass border border-border/50 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" className="border-border/50">Save as Draft</Button>
        <Button className="gradient-primary hover:neon-glow">
          <Save className="h-4 w-4 mr-2" /> Publish Product
        </Button>
      </div>
    </div>
  );
};

export default AddProductPage;
