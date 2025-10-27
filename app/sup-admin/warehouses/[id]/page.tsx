"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Warehouse,
  MapPin,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Activity,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Crown,
  Calendar,
  Star,
  Target,
  Zap,
  Clock,
  Percent,
  CreditCard,
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import fetchWareHouseData from "@/hooks/fetch-invidual-data"
import Link from "next/link"
import { Input } from "@/components/ui/input"

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function WarehouseDetailsPage() {
  const router = useRouter()
  const path = usePathname()
  const [selectedPeriod, setSelectedPeriod] = useState("12months")
  const [detailedAnalytics, setDetailedAnalytics] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const wareHouseId = path?.split("/")[3]
  
  // Fetch warehouse data using the ID from params
  const { data: warehouseData, loading, error } = fetchWareHouseData(`/api/warehouse/list`,{id:wareHouseId})

  // Fetch detailed analytics
  useEffect(() => {
    const fetchDetailedAnalytics = async () => {
      if (!wareHouseId) return
      
      setIsLoadingAnalytics(true)
      try {
        const response = await fetch('/api/warehouse/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ warehouseId: wareHouseId })
        })
        
        if (response.ok) {
          const data = await response.json()
          setDetailedAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching detailed analytics:', error)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    fetchDetailedAnalytics()
  }, [wareHouseId])

  // Loading state
  if (loading) {
    return (
      <>
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Loading warehouse analytics...</p>
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default" className="bg-red-600">Admin</Badge>
      case "manager":
        return <Badge variant="default" className="bg-blue-600">Manager</Badge>
      case "sales":
        return <Badge variant="default" className="bg-green-600">Sales</Badge>
      case "purchase":
        return <Badge variant="default" className="bg-purple-600">Purchase</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', priority: 'critical' }
    if (quantity <= 5) return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-100', priority: 'high' }
    if (quantity <= 10) return { status: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-100', priority: 'medium' }
    if (quantity <= 20) return { status: 'Warning', color: 'text-orange-600', bg: 'bg-orange-100', priority: 'low' }
    return { status: 'Good', color: 'text-green-600', bg: 'bg-green-100', priority: 'none' }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-red-500">High</Badge>
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>
      case 'low':
        return <Badge variant="default" className="bg-orange-500">Low</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getCustomerSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return <Badge variant="default" className="bg-purple-600">VIP</Badge>
      case 'Premium':
        return <Badge variant="default" className="bg-blue-600">Premium</Badge>
      case 'Regular':
        return <Badge variant="default" className="bg-green-600">Regular</Badge>
      default:
        return <Badge variant="outline">New</Badge>
    }
  }

  const formatGrowth = (value: number) => {
    const isPositive = value >= 0
    const icon = isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        {icon}
        {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  const refreshData = () => {
    window.location.reload()
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
                  <BreadcrumbPage>{warehouseData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Warehouse Header with Enhanced Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Warehouse className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-blue-600">{warehouseData.name}</h1>
                  <Badge variant="outline" className="px-3 py-1 font-mono text-sm">
                    {warehouseData.warehouseCode}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{warehouseData.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{warehouseData.stats?.assignedUsers || 0} Active Users</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={refreshData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => router.push('/sup-admin/warehouses/list')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
              <Button asChild className="gap-2">
                <Link href={`/sup-admin/warehouses/${wareHouseId}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit Warehouse
                </Link>
              </Button>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(warehouseData.stats?.totalSales || 0)}</div>
                <div className="flex items-center gap-2 mt-1">
                  {detailedAnalytics?.performanceMetrics?.salesGrowth && formatGrowth(detailedAnalytics.performanceMetrics.salesGrowth)}
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warehouseData.stats?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatCurrency((warehouseData.stats?.totalSales || 0) / (warehouseData.stats?.totalOrders || 1))}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warehouseData.stats?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedAnalytics?.lowStockProducts?.length || 0} low stock
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warehouseData.stats?.assignedUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedAnalytics?.performanceMetrics?.repeatCustomerRate?.toFixed(1) || 0}% repeat rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Performance Metrics */}
          {detailedAnalytics?.performanceMetrics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedAnalytics.performanceMetrics.profitMargin.toFixed(1)}%</div>
                  <Progress value={detailedAnalytics.performanceMetrics.profitMargin} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedAnalytics.performanceMetrics.conversionRate.toFixed(1)}%</div>
                  <Progress value={detailedAnalytics.performanceMetrics.conversionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(detailedAnalytics.salesTrends?.dailyAverage || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Revenue per day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Stock Turnover
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedAnalytics.inventoryAnalytics?.stockTurnover?.toFixed(1) || 0}x</div>
                  <p className="text-xs text-muted-foreground mt-1">Times per year</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Critical Alerts */}
          {detailedAnalytics?.lowStockProducts && detailedAnalytics.lowStockProducts.filter((p: any) => p.priority === 'critical' || p.priority === 'high').length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertTriangle className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Critical Stock Alerts</p>
                    <p className="text-sm">
                      {detailedAnalytics.lowStockProducts.filter((p: any) => p.priority === 'critical').length} products are out of stock, 
                      {detailedAnalytics.lowStockProducts.filter((p: any) => p.priority === 'high').length} are critically low
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
              <TabsTrigger value="products">Inventory</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="users">Team</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Monthly Sales Trend */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sales Performance Trend
                      </CardTitle>
                      <CardDescription>Revenue, orders, and profit over the last 12 months</CardDescription>
                    </div>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="orders">Orders</SelectItem>
                        <SelectItem value="profit">Profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {detailedAnalytics?.monthlySalesData ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={detailedAnalytics.monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' || name === 'profit' ? formatCurrency(value as number) : value,
                            name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Profit'
                          ]}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                        <Bar yAxisId="right" dataKey="orders" fill="#10b981" />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="profit"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <Activity className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Top Performing Products
                    </CardTitle>
                    <CardDescription>Best sellers by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {detailedAnalytics?.topProducts?.slice(0, 5).map((product: any, index: number) => (
                        <div key={product.productId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.totalQuantity} units • {product.timesOrdered} orders
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(product.totalRevenue)}</p>
                            <p className="text-sm text-green-600">+{formatCurrency(product.totalProfit)} profit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Segments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      Customer Segments
                    </CardTitle>
                    <CardDescription>Customer distribution by value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {detailedAnalytics?.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                        <div key={customer.customerId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{customer.customerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{customer.customerName}</p>
                                {getCustomerSegmentBadge(customer.segment)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {customer.totalOrders} orders • Avg: {formatCurrency(customer.avgOrderValue)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              {/* Payment Methods Analytics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {detailedAnalytics?.paymentAnalytics ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={detailedAnalytics.paymentAnalytics}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="totalAmount"
                            label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                          >
                            {detailedAnalytics.paymentAnalytics.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">No payment data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold">{formatCurrency(detailedAnalytics?.warehouse?.analytics?.totalSales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid</span>
                      <span className="font-bold text-green-600">{formatCurrency(detailedAnalytics?.warehouse?.analytics?.totalPaid || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Balance</span>
                      <span className="font-bold text-red-600">{formatCurrency(detailedAnalytics?.warehouse?.analytics?.totalBalance || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Best Month</span>
                      <span className="font-bold">
                        {detailedAnalytics?.salesTrends?.bestPerformingMonth?.month} - {formatCurrency(detailedAnalytics?.salesTrends?.bestPerformingMonth?.revenue || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales Transactions</CardTitle>
                  <CardDescription>Latest sales activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search sales..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>

                  {detailedAnalytics?.recentSales && detailedAnalytics.recentSales.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedAnalytics.recentSales
                          .filter((sale: any) => 
                            searchTerm === "" || 
                            sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sale.Customer_online?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .slice(0, 15).map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-mono">{sale.invoiceNo}</TableCell>
                            <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{sale.Customer_online?.name || 'Walk-in'}</TableCell>
                            <TableCell>{sale.saleItems?.length || 0}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(sale.grandTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.balance)}</TableCell>
                            <TableCell>
                              {sale.balance === 0 && <Badge className="bg-green-600">Paid</Badge>}
                              {sale.balance === sale.grandTotal && <Badge variant="destructive">Unpaid</Badge>}
                              {sale.balance > 0 && sale.balance < sale.grandTotal && <Badge className="bg-yellow-600">Partial</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {sale.paymentMethod?.map((pm: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {pm.method}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Sales Found</h3>
                      <p className="text-muted-foreground">No sales transactions match your search criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {/* Inventory Overview */}
              <div className="grid gap-6 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(detailedAnalytics?.inventoryAnalytics?.totalValue || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Inventory worth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Low Stock Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{formatCurrency(detailedAnalytics?.inventoryAnalytics?.lowStockValue || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">At risk value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Avg Product Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(detailedAnalytics?.inventoryAnalytics?.averageProductValue || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Per product</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Stock Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{detailedAnalytics?.lowStockProducts?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Alerts */}
              {detailedAnalytics?.lowStockProducts && detailedAnalytics.lowStockProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Stock Alerts
                    </CardTitle>
                    <CardDescription>Products requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Value at Risk</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedAnalytics.lowStockProducts.slice(0, 10).map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${product.quantity === 0 ? 'text-red-600' : product.quantity <= 5 ? 'text-red-500' : 'text-yellow-500'}`}>
                                  {product.quantity}
                                </span>
                                <Progress 
                                  value={Math.min((product.quantity / 50) * 100, 100)} 
                                  className="w-20 h-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>{getPriorityBadge(product.priority)}</TableCell>
                            <TableCell>{formatCurrency(product.retailPrice * product.quantity)}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Reorder</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* All Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Complete product inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  {warehouseData.products && warehouseData.products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Barcode</TableHead>
                          <TableHead>Stock Status</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Retail Price</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouseData.products.map((product: any) => {
                          const stockStatus = getStockStatus(product.quantity)
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                              <TableCell>
                                <Badge className={`${stockStatus.bg} ${stockStatus.color} border-0`}>
                                  {stockStatus.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${product.quantity <= 10 ? "text-red-500" : "text-green-600"}`}>
                                    {product.quantity}
                                  </span>
                                  <Progress 
                                    value={Math.min((product.quantity / 100) * 100, 100)} 
                                    className="w-16 h-2"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>{product.unit}</TableCell>
                              <TableCell>{formatCurrency(product.cost)}</TableCell>
                              <TableCell>{formatCurrency(product.retailPrice)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(product.retailPrice * product.quantity)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                      <p className="text-muted-foreground">This warehouse doesn't have any products yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analytics & Insights</CardTitle>
                  <CardDescription>Detailed customer behavior and purchasing patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {detailedAnalytics?.topCustomers && detailedAnalytics.topCustomers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Total Spent</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Avg Order</TableHead>
                          <TableHead>First Purchase</TableHead>
                          <TableHead>Last Purchase</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedAnalytics.topCustomers.map((customer: any, index: number) => (
                          <TableRow key={customer.customerId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{customer.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{customer.customerName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getCustomerSegmentBadge(customer.segment)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.customerType}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                            <TableCell className="text-right">{customer.totalOrders}</TableCell>
                            <TableCell className="text-right">{formatCurrency(customer.avgOrderValue)}</TableCell>
                            <TableCell>{new Date(customer.firstPurchase).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(customer.lastPurchase).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Customer Data</h3>
                      <p className="text-muted-foreground">Customer analytics will appear here once sales are recorded.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {detailedAnalytics?.performanceMetrics && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Conversion Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-bold">{detailedAnalytics.performanceMetrics.conversionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={detailedAnalytics.performanceMetrics.conversionRate} />
                      
                      <div className="flex justify-between">
                        <span>Repeat Customer Rate</span>
                        <span className="font-bold">{detailedAnalytics.performanceMetrics.repeatCustomerRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={detailedAnalytics.performanceMetrics.repeatCustomerRate} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Financial Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Profit Margin</span>
                        <span className="font-bold text-green-600">{detailedAnalytics.performanceMetrics.profitMargin.toFixed(1)}%</span>
                      </div>
                      <Progress value={detailedAnalytics.performanceMetrics.profitMargin} />
                      
                      <div className="flex justify-between">
                        <span>Average Order Value</span>
                        <span className="font-bold">{formatCurrency(detailedAnalytics.performanceMetrics.averageOrderValue)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Growth Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Sales Growth</span>
                        {formatGrowth(detailedAnalytics.performanceMetrics.salesGrowth)}
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Best Month</span>
                        <span className="font-bold">{detailedAnalytics.salesTrends?.bestPerformingMonth?.month}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Revenue</span>
                        <span className="font-bold">{formatCurrency(detailedAnalytics.salesTrends?.bestPerformingMonth?.revenue || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Warehouse staff and their roles</CardDescription>
                </CardHeader>
                <CardContent>
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
                                  <AvatarFallback>
                                    {user.userName.split(" ").map((n: string) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.userName}</div>
                                  <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phoneNumber}</TableCell>
                            <TableCell>
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : <span className="text-muted-foreground">Never</span>
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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
                                    Remove Access
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
                      <p className="text-muted-foreground">This warehouse doesn't have any assigned users yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(detailedAnalytics?.warehouse?.analytics?.totalSales || 0)}</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{detailedAnalytics?.warehouse?.analytics?.totalOrders || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Inventory Value</span>
                        <span className="font-medium">{formatCurrency(detailedAnalytics?.inventoryAnalytics?.totalValue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin</span>
                        <span className="font-medium">{detailedAnalytics?.performanceMetrics?.profitMargin?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Turnover</span>
                        <span className="font-medium">{detailedAnalytics?.inventoryAnalytics?.stockTurnover?.toFixed(1) || 0}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export & Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Monthly Performance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Sales Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      Inventory Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Customer Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Custom Date Range Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
     </>
  )
}