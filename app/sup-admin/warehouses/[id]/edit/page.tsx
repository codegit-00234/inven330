"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Warehouse,
  Save,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  AlertTriangle,
  Clock,
  Loader2,
  X,
  Info
} from "lucide-react"
import fetchWareHouseData from "@/hooks/fetch-invidual-data"
import axios from "axios"

interface FormErrors {
  name?: string
  warehouseCode?: string
  address?: string
  phoneNumber?: string
  email?: string
  description?: string
}

export default function EditWarehousePage() {
  const params = useParams()
  const router = useRouter()
  const path = usePathname()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const wareHouseId = path?.split("/")[3]
    
  // Fetch warehouse data using the ID from params
  const { data: warehouseData, loading, error } = fetchWareHouseData(`/api/warehouse/list`,{id:wareHouseId})

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    warehouseCode: "",
    address: "",
    phoneNumber: "",
    email: "",
    description: "",
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    warehouseCode: "",
    address: "",
    phoneNumber: "",
    email: "",
    description: "",
  })

  useEffect(() => {
    if (warehouseData) {
      const data = {
        name: warehouseData.name || "",
        warehouseCode: warehouseData.warehouseCode || "",
        address: warehouseData.address || "",
        phoneNumber: warehouseData.phoneNumber || "",
        email: warehouseData.email || "",
        description: warehouseData.description || "",
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [warehouseData])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
    )
    setHasUnsavedChanges(hasChanges)
  }, [formData, originalData])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Warehouse name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Warehouse name must be at least 2 characters"
    }

    // Warehouse code validation
    if (!formData.warehouseCode.trim()) {
      newErrors.warehouseCode = "Warehouse code is required"
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.warehouseCode)) {
      newErrors.warehouseCode = "Warehouse code can only contain letters, numbers, hyphens, and underscores"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please provide a complete address"
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Description validation (optional but with length limit)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }

    // Clear submit error
    if (submitError) {
      setSubmitError("")
    }
  }

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return
    }

    if (!hasUnsavedChanges) {
      setSubmitError("No changes to save")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const updatedWarehouse = {
        ...warehouseData,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      await axios.put("/api/warehouse", updatedWarehouse)

      // Update original data to reflect saved changes
      setOriginalData(formData)
      setShowSuccessDialog(true)
    } catch (error: any) {
      console.error("Error updating warehouse:", error)
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        "Failed to update warehouse. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false)
    router.push(`/sup-admin/warehouses/${wareHouseId}`)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push(`/sup-admin/warehouses/${wareHouseId}`)
      }
    } else {
      router.push(`/sup-admin/warehouses/${wareHouseId}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Loading warehouse details...</p>
            </div>
          </div>
       </>
    )
  }

  // Error state
  if (!warehouseData || error) {
    return (
      <>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold mb-2">Warehouse Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested warehouse could not be found.</p>
              <Button onClick={() => router.push("/sup-admin/warehouses/list")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Warehouses
              </Button>
            </div>
          </div>
        </>
    )
  }

  return (
    <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/sup-admin/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/sup-admin/warehouses/list">Warehouses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/sup-admin/warehouses/${wareHouseId}`}>{warehouseData?.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Edit Warehouse</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono">{warehouseData.warehouseCode}</Badge>
                  {hasUnsavedChanges && (
                    <Badge variant="destructive" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-800">
                You have unsaved changes. Make sure to save before leaving this page.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Error */}
          {submitError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update warehouse basic details and identification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Warehouse Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="Enter warehouse name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="warehouseCode">
                        Warehouse Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="warehouseCode"
                        value={formData.warehouseCode}
                        onChange={(e) => handleInputChange("warehouseCode", e.target.value.toUpperCase())}
                        className={errors.warehouseCode ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="Enter warehouse code"
                        disabled={true} // Usually warehouse codes shouldn't be changed
                      />
                      {errors.warehouseCode && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.warehouseCode}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Warehouse code cannot be changed after creation
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={errors.description ? "border-red-500 focus:border-red-500" : ""}
                      rows={3}
                      placeholder="Brief description of the warehouse..."
                      maxLength={500}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Update warehouse contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className={errors.phoneNumber ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                        placeholder="warehouse@company.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>Update warehouse location details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Complete Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                      rows={3}
                      placeholder="Enter complete address including street, city, state, and postal code"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary & Preview */}
            <div className="space-y-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Warehouse Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {warehouseData.createdAt 
                        ? new Date(warehouseData.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">
                      {warehouseData.updatedAt 
                        ? new Date(warehouseData.updatedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Preview</CardTitle>
                  <CardDescription>How the contact information will appear</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.phoneNumber || "Phone not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all">{formData.email || "Email not provided"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="break-words">
                      {formData.address || "Address not provided"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Products</span>
                    <span className="text-sm font-medium">
                      {warehouseData.stats?.totalProducts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Users</span>
                    <span className="text-sm font-medium">
                      {warehouseData.stats?.assignedUsers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <span className="text-sm font-medium">
                      {warehouseData.stats?.totalOrders || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={!hasUnsavedChanges || isSubmitting} 
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Warehouse Updated Successfully!
              </DialogTitle>
              <DialogDescription>
                The warehouse "{formData.name}" has been updated successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button onClick={handleCloseSuccessDialog} className="w-full">
                View Warehouse Details
              </Button>
              <Button variant="outline" onClick={() => router.push("/sup-admin/warehouses/list")} className="w-full">
                Back to Warehouses List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
  )
}
