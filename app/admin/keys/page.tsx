'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, CheckCircle2, XCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
}

interface Key {
  id: number
  product_id: string
  key_value: string
  is_used: boolean
  order_id?: string
  customer_email?: string
  used_at?: string
  created_at: string
}

interface Stock {
  product_id: string
  available_stock: number
  used_stock: number
  total_stock: number
}

export default function KeysPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [keys, setKeys] = useState<Key[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [delimiter, setDelimiter] = useState<'comma' | 'newline' | 'space'>('newline')
  const [keysInput, setKeysInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchKeys()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchKeys(selectedProduct)
    } else {
      fetchKeys()
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/admin/products')
      const result = await response.json()
      if (result.success) {
        setProducts(result.data || [])
        if ((result.data || []).length === 0) {
          toast.info('No products found. Make sure you have products in your PayNow store.')
        }
      } else {
        toast.error(result.error || 'Failed to fetch products')
      }
    } catch (error) {
      toast.error('Failed to fetch products. Check console for details.')
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchKeys = async (productId?: string) => {
    try {
      const url = productId 
        ? `/api/admin/keys?product_id=${productId}`
        : '/api/admin/keys'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setKeys(result.data.keys || [])
        setStock(result.data.stock || [])
      }
    } catch (error) {
      toast.error('Failed to fetch keys')
    }
  }

  const handleUploadKeys = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    if (!keysInput.trim()) {
      toast.error('Please enter keys')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          keys: keysInput,
          delimiter,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Successfully uploaded ${result.data.inserted} keys`)
        setKeysInput('')
        fetchKeys(selectedProduct)
      } else {
        toast.error(result.error || 'Failed to upload keys')
      }
    } catch (error) {
      toast.error('Failed to upload keys')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('product_id', selectedProduct)
      formData.append('file', file)

      const response = await fetch('/api/admin/keys/upload-file', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Successfully uploaded ${result.data.inserted} keys from file`)
        setFile(null)
        fetchKeys(selectedProduct)
      } else {
        toast.error(result.error || 'Failed to upload keys from file')
      }
    } catch (error) {
      toast.error('Failed to upload keys from file')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to delete this key?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/keys?id=${keyId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Key deleted successfully')
        fetchKeys(selectedProduct)
      } else {
        toast.error(result.error || 'Failed to delete key')
      }
    } catch (error) {
      toast.error('Failed to delete key')
    }
  }

  const getStockForProduct = (productId: string) => {
    return stock.find((s) => s.product_id === productId)
  }

  const selectedStock = selectedProduct ? getStockForProduct(selectedProduct) : null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Keys Management</h1>

      {/* Product Selection */}
      <Card className="p-6 mb-6">
        <Label htmlFor="product" className="mb-2 block">
          Select Product
        </Label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loadingProducts}>
          <SelectTrigger id="product" className="w-full">
            <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select a product"} />
          </SelectTrigger>
          <SelectContent>
            {products.length === 0 && !loadingProducts && (
              <SelectItem value="no-products" disabled>
                No products available
              </SelectItem>
            )}
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedStock && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-500">{selectedStock.available_stock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl font-bold text-red-500">{selectedStock.used_stock}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{selectedStock.total_stock}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Keys Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Keys</h2>

        {/* Manual Input */}
        <div className="mb-6">
          <Label htmlFor="delimiter" className="mb-2 block">
            Delimiter
          </Label>
          <Select value={delimiter} onValueChange={(value: 'comma' | 'newline' | 'space') => setDelimiter(value)}>
            <SelectTrigger id="delimiter" className="w-full mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comma">Comma (test1, test2)</SelectItem>
              <SelectItem value="newline">New Line (one per line)</SelectItem>
              <SelectItem value="space">Space (test1 test2)</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="keys" className="mb-2 block">
            Keys
          </Label>
          <Textarea
            id="keys"
            placeholder={
              delimiter === 'comma'
                ? 'test1, test2, test3'
                : delimiter === 'newline'
                ? 'test1\ntest2\ntest3'
                : 'test1 test2 test3'
            }
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            className="mb-4 min-h-[120px] font-mono"
            rows={6}
          />

          <Button onClick={handleUploadKeys} disabled={uploading || !selectedProduct || !keysInput.trim()}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Keys'}
          </Button>
        </div>

        {/* File Upload */}
        <div className="border-t pt-6">
          <Label htmlFor="file" className="mb-2 block">
            Or Upload TXT File
          </Label>
          <div className="flex gap-4">
            <Input
              id="file"
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <Button onClick={handleFileUpload} disabled={uploading || !selectedProduct || !file}>
              <FileText className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Keys List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {selectedProduct ? 'Product Keys' : 'All Keys'}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Key</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer Email</th>
                <th className="text-left p-2">Used At</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b">
                  <td className="p-2 font-mono text-sm">{key.key_value}</td>
                  <td className="p-2">
                    {key.is_used ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        Used
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Available
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-sm">{key.order_id || '-'}</td>
                  <td className="p-2 text-sm">{key.customer_email || '-'}</td>
                  <td className="p-2 text-sm">{key.used_at ? new Date(key.used_at).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    {!key.is_used && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {keys.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No keys found</p>
          )}
        </div>
      </Card>
    </div>
  )
}

