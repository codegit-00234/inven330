"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Warehouse,
  MapPin,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Truck,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  BarChart3,
  PieChartIcon,
  Activity,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  BarChart,
  Bar,
  Cell
} from "recharts"
import fetchData from "@/hooks/fetch-data"
import { formatCurrency } from "@/lib/utils"
import fetchWareHouseData from "@/hooks/fetch-invidual-data"
import axios from "axios"

// Sample financial data

// Sample monthly data for charts
const monthlyData = [
  { month: "Jan", sales: 12500, purchases: 8900, profit: 3600 },
  { month: "Feb", sales: 15200, purchases: 10200, profit: 5000 },
  { month: "Mar", sales: 18700, purchases: 12800, profit: 5900 },
  { month: "Apr", sales: 16300, purchases: 11500, profit: 4800 },
  { month: "May", sales: 21400, purchases: 14200, profit: 7200 },
  { month: "Jun", sales: 19800, purchases: 13100, profit: 6700 },
]

// Sample category data for pie chart
const categoryData = [
  { name: "Electronics", value: 45, color: "#0088FE" },
  { name: "Computers", value: 30, color: "#00C49F" },
  { name: "Audio", value: 15, color: "#FFBB28" },
  { name: "Tablets", value: 10, color: "#FF8042" },
]

// Sample recent transactions


// Sample available users to add
const availableUsers = [
  { id: "USR-004", name: "Sarah Admin", role: "admin", email: "sarah@inventorypro.com" },
  { id: "USR-005", name: "Tom Worker", role: "staff", email: "tom@inventorypro.com" },
  { id: "USR-006", name: "Lisa Supervisor", role: "manager", email: "lisa@inventorypro.com" },
]

export default function WarehouseDetailsPage() {
  const router = useRouter()
  const path = usePathname()
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const wareHouseId = path?.split("/")[3]
  
  // Fetch warehouse data using the ID from params
  const { data: warehouseData, loading, error } = fetchWareHouseData(`/api/warehouse/list`,{id:wareHouseId})
  const [dashboard, setDashboard] = useState<any>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      setDashboardLoading(true)
      try {
        const res = await axios.post("/api/warehouse/dashboard", { warehouseId: wareHouseId })
        setDashboard(res.data)
      } catch (err: any) {
        setDashboardError(err)
      } finally {
        setDashboardLoading(false)
      }
    }
    if (wareHouseId) fetchDashboard()
  }, [wareHouseId])

  // Loading state
  if (loading) {
    return (
      <>
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Loading warehouse details...</p>
            </div>
          </div>
       </>
    )
  }

  // Error state
  if (error || !warehouseData) {
    return (
      <>
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-semibold mb-2">Warehouse Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The warehouse you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={() => router.push('/sup-admin/warehouses/list')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Warehouses
              </Button>
            </div>
          </div>
       </>
    )
  }

  if (dashboardLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="bg-red-600">
            Admin
          </Badge>
        )
      case "manager":
        return (
          <Badge variant="default" className="bg-blue-600">
            Manager
          </Badge>
        )
      case "staff":
        return <Badge variant="secondary">Staff</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
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
                  <BreadcrumbLink href="/sup-admin/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/sup-admin/warehouses/list">Warehouses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{warehouseData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Warehouse Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg">
                <Warehouse className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-blue-600">{warehouseData.name}</h1>
                <p className="text-muted-foreground font-mono">{warehouseData.warehouseCode}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{warehouseData.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{warehouseData.stats?.assignedUsers || 0} Users</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/sup-admin/warehouses/list')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Warehouse
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          {dashboard && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.metrics.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Active inventory items</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboard.metrics.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Total sales revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.metrics.totalSales}</div>
                  <p className="text-xs text-muted-foreground">Completed transactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.metrics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Active warehouse staff</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Warehouse Details */}
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Information</CardTitle>
              <CardDescription>
                Basic details and contact information for this warehouse
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Warehouse Name</Label>
                <p className="text-sm text-muted-foreground">{warehouseData.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Warehouse Code</Label>
                <p className="text-sm text-muted-foreground">{warehouseData.warehouseCode}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{warehouseData.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone Number</Label>
                <p className="text-sm text-muted-foreground">{warehouseData.phoneNumber}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">{warehouseData.address}</p>
              </div>
              {warehouseData.description && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{warehouseData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="sales">Recent Sales</TabsTrigger>
              <TabsTrigger value="top">Top Products</TabsTrigger>
              <TabsTrigger value="users">Assigned Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={dashboard.salesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="top" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Top 5 products by sales revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.topProducts && dashboard.topProducts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Units Sold</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.topProducts.map((product: any) => (
                          <TableRow key={product.productId}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.sales}</TableCell>
                            <TableCell>{formatCurrency(product.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Top Products Data</h3>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Inventory</CardTitle>
                  <CardDescription>
                    All products currently stored in this warehouse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {warehouseData.products && warehouseData.products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Barcode</TableHead>
                          
                          <TableHead>Stock</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Wholesale Price</TableHead>
                          <TableHead>Retail Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouseData.products.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.barcode}</TableCell>
                            
                            <TableCell>{product.quantity < 20 ? <div className="text-red-500">{product.quantity}</div>:<div className="text-green-500">{product.quantity}</div>}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{product.cost}</TableCell>
                            <TableCell>{formatCurrency(product.wholeSalePrice)}</TableCell>
                            <TableCell>{formatCurrency(product.retailPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                      <p className="text-muted-foreground">
                        This warehouse doesn't have any products yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    Latest sales transactions from this warehouse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {warehouseData.sale && warehouseData.sale.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sale ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouseData.sale.slice(0, 10).map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                            <TableCell>
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{sale.selectedCustomer?.name || 'Walk-in Customer'}</TableCell>
                            <TableCell>{sale.saleItems?.length || 0}</TableCell>
                            <TableCell>{formatCurrency(sale.grandTotal)}</TableCell>
                            <TableCell>{formatCurrency(sale.balance)}</TableCell>
                            <TableCell>
                              {sale.balance == 0 &&
                              <Badge variant="default" className="bg-green-600">
                              Completed
                            </Badge>
                            }
                            {sale.balance === sale.grandTotal && 
                            <Badge variant="default" className="bg-red-600">
                            Not Paid
                          </Badge>
                          }
                          {(sale.balance > 0 && sale.balance < sale.grandTotal) &&
                           <Badge variant="default" className="bg-yellow-600">
                           Pending
                         </Badge>
                         }
                             
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Sales Found</h3>
                      <p className="text-muted-foreground">
                        This warehouse doesn't have any sales records yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Assigned Users</h2>
                  <p className="text-sm text-muted-foreground">
                    Users who have access to this warehouse
                  </p>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add User to Warehouse</DialogTitle>
                      <DialogDescription>
                        Select a user to assign to this warehouse. They will gain access to manage inventory here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-select">Select User</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role}) - {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddUserOpen(false)} disabled={!selectedUser}>
                        Add User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {warehouseData.users && warehouseData.users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouseData.users.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="" alt={user.userName} />
                                  <AvatarFallback>
                                    {user.userName
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.userName}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phoneNumber}</TableCell>
                            <TableCell>
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : 'Never'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove from Warehouse
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Users Assigned</h3>
                      <p className="text-muted-foreground">
                        This warehouse doesn't have any assigned users yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
     </>
  )
}