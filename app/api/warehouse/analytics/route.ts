import { PrismaClient } from "@/prisma/generated/online";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all warehouses with their sales data
    const warehouses = await prisma.warehouses_online.findMany({
      where: { isDeleted: false },
      include: {
        sale: {
          where: { isDeleted: false },
          include: {
            saleItems: true
          }
        },
        products: {
          where: { isDeleted: false }
        },
        users: {
          where: { isDeleted: false }
        },
        customer: {
          where: { isDeleted: false }
        }
      }
    });

    // Calculate analytics for each warehouse
    const warehouseAnalytics = warehouses.map(warehouse => {
      const totalSales = warehouse.sale.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      const totalOrders = warehouse.sale.length;
      const totalProducts = warehouse.products.length;
      const totalUsers = warehouse.users.length;
      const totalCustomers = warehouse.customer.length;

      // Low stock products (quantity <= 10)
      const lowStockProducts = warehouse.products.filter(product => product.quantity <= 10).length;

      // Get monthly sales for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const recentSales = warehouse.sale.filter(sale => 
        new Date(sale.createdAt) >= sixMonthsAgo
      );

      // Group sales by month
      const monthlySales = recentSales.reduce((acc: any, sale) => {
        const month = new Date(sale.createdAt).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { month, sales: 0, revenue: 0, orders: 0 };
        }
        acc[month].sales += sale.grandTotal || 0;
        acc[month].revenue += sale.grandTotal || 0;
        acc[month].orders += 1;
        return acc;
      }, {});

      const monthlyData = Object.values(monthlySales);

      return {
        id: warehouse.id,
        warehouseCode: warehouse.warehouseCode,
        name: warehouse.name,
        address: warehouse.address,
        phoneNumber: warehouse.phoneNumber,
        email: warehouse.email,
        description: warehouse.description,
        analytics: {
          totalSales,
          totalOrders,
          totalProducts,
          totalUsers,
          totalCustomers,
          lowStockProducts,
          avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
          monthlyData: monthlyData.slice(-6) // Last 6 months
        }
      };
    });

    // Sort warehouses by total sales (highest first)
    warehouseAnalytics.sort((a, b) => b.analytics.totalSales - a.analytics.totalSales);

    // Calculate overall statistics
    const totalRevenue = warehouseAnalytics.reduce((sum, w) => sum + w.analytics.totalSales, 0);
    const totalOrders = warehouseAnalytics.reduce((sum, w) => sum + w.analytics.totalOrders, 0);
    const totalProducts = warehouseAnalytics.reduce((sum, w) => sum + w.analytics.totalProducts, 0);

    return NextResponse.json({
      warehouses: warehouseAnalytics,
      summary: {
        totalWarehouses: warehouses.length,
        totalRevenue,
        totalOrders,
        totalProducts,
        topPerformer: warehouseAnalytics[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching warehouse analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { warehouseId } = await req.json();

    // Get detailed analytics for a specific warehouse
    const warehouse = await prisma.warehouses_online.findUnique({
      where: { 
        warehouseCode: warehouseId,
        isDeleted: false 
      },
      include: {
        sale: {
          where: { isDeleted: false },
          include: {
            saleItems: {
              include: {
                Product_online: true
              }
            },
            Customer_online: true,
            paymentMethod: true
          },
          orderBy: { createdAt: 'desc' }
        },
        products: {
          where: { isDeleted: false },
          orderBy: { quantity: 'asc' }
        },
        users: {
          where: { isDeleted: false }
        },
        customer: {
          where: { isDeleted: false }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Calculate detailed analytics
    const totalSales = warehouse.sale.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    const totalOrders = warehouse.sale.length;
    const totalProducts = warehouse.products.length;
    const totalUsers = warehouse.users.length;
    const totalCustomers = warehouse.customer.length;
    const totalPaid = warehouse.sale.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
    const totalBalance = warehouse.sale.reduce((sum, sale) => sum + (sale.balance || 0), 0);

    // Monthly sales data for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlySalesData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthSales = warehouse.sale.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });

      const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      const monthOrders = monthSales.length;
      const monthProfit = monthSales.reduce((sum, sale) => {
        const saleProfit = sale.saleItems.reduce((itemSum, item) => itemSum + ((item.selectedPrice - item.cost) * item.quantity), 0);
        return sum + saleProfit;
      }, 0);

      monthlySalesData.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        revenue: monthRevenue,
        orders: monthOrders,
        profit: monthProfit,
        avgOrder: monthOrders > 0 ? monthRevenue / monthOrders : 0
      });
    }

    // Top selling products with detailed analytics
    const productSales: any = {};
    warehouse.sale.forEach(sale => {
      sale.saleItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            totalRevenue: 0,
            totalProfit: 0,
            timesOrdered: 0,
            avgPrice: 0,
            lastSold: sale.createdAt
          };
        }
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalRevenue += item.total;
        productSales[item.productId].totalProfit += (item.selectedPrice - item.cost) * item.quantity;
        productSales[item.productId].timesOrdered += 1;
        productSales[item.productId].avgPrice = productSales[item.productId].totalRevenue / productSales[item.productId].totalQuantity;
        
        if (new Date(sale.createdAt) > new Date(productSales[item.productId].lastSold)) {
          productSales[item.productId].lastSold = sale.createdAt;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 15);

    // Low stock alerts with priority levels
    const lowStockProducts = warehouse.products
      .filter(product => product.quantity <= 20)
      .map(product => ({
        ...product,
        priority: product.quantity === 0 ? 'critical' : product.quantity <= 5 ? 'high' : product.quantity <= 10 ? 'medium' : 'low',
        daysOfStock: product.quantity // This could be enhanced with sales velocity calculation
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // Customer analytics with segmentation
    const customerPurchases: any = {};
    warehouse.sale.forEach(sale => {
      if (sale.selectedCustomerId) {
        if (!customerPurchases[sale.selectedCustomerId]) {
          customerPurchases[sale.selectedCustomerId] = {
            customerId: sale.selectedCustomerId,
            customerName: sale.Customer_online?.name || 'Unknown',
            customerType: sale.Customer_online?.type || 'individual',
            totalSpent: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            firstPurchase: sale.createdAt,
            lastPurchase: sale.createdAt,
            totalItems: 0
          };
        }
        customerPurchases[sale.selectedCustomerId].totalSpent += sale.grandTotal || 0;
        customerPurchases[sale.selectedCustomerId].totalOrders += 1;
        customerPurchases[sale.selectedCustomerId].totalItems += sale.saleItems.length;
        
        if (new Date(sale.createdAt) > new Date(customerPurchases[sale.selectedCustomerId].lastPurchase)) {
          customerPurchases[sale.selectedCustomerId].lastPurchase = sale.createdAt;
        }
        if (new Date(sale.createdAt) < new Date(customerPurchases[sale.selectedCustomerId].firstPurchase)) {
          customerPurchases[sale.selectedCustomerId].firstPurchase = sale.createdAt;
        }
      }
    });

    // Calculate average order values and customer segments
    Object.values(customerPurchases).forEach((customer: any) => {
      customer.avgOrderValue = customer.totalSpent / customer.totalOrders;
      customer.customerLifetimeValue = customer.totalSpent;
      customer.segment = customer.totalSpent > 50000 ? 'VIP' : customer.totalSpent > 20000 ? 'Premium' : customer.totalSpent > 5000 ? 'Regular' : 'New';
    });

    const topCustomers = Object.values(customerPurchases)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 15);

    // Sales performance metrics
    const performanceMetrics = {
      conversionRate: totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0,
      repeatCustomerRate: totalCustomers > 0 ? (Object.values(customerPurchases).filter((c: any) => c.totalOrders > 1).length / totalCustomers) * 100 : 0,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      profitMargin: totalSales > 0 ? ((totalSales - warehouse.sale.reduce((sum, sale) => sum + sale.saleItems.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0), 0)) / totalSales) * 100 : 0,
      salesGrowth: monthlySalesData.length >= 2 ? ((monthlySalesData[monthlySalesData.length - 1].revenue - monthlySalesData[monthlySalesData.length - 2].revenue) / monthlySalesData[monthlySalesData.length - 2].revenue) * 100 : 0
    };

    // Payment method analytics
    const paymentMethods: any = {};
    warehouse.sale.forEach(sale => {
      sale.paymentMethod.forEach(payment => {
        if (!paymentMethods[payment.method]) {
          paymentMethods[payment.method] = {
            method: payment.method,
            totalAmount: 0,
            transactionCount: 0
          };
        }
        paymentMethods[payment.method].totalAmount += payment.amount;
        paymentMethods[payment.method].transactionCount += 1;
      });
    });

    const paymentAnalytics = Object.values(paymentMethods)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount);

    // Inventory analytics
    const inventoryAnalytics = {
      totalValue: warehouse.products.reduce((sum, product) => sum + (product.retailPrice * product.quantity), 0),
      lowStockValue: lowStockProducts.reduce((sum, product) => sum + (product.retailPrice * product.quantity), 0),
      averageProductValue: warehouse.products.length > 0 ? warehouse.products.reduce((sum, product) => sum + product.retailPrice, 0) / warehouse.products.length : 0,
      stockTurnover: totalSales > 0 ? totalSales / (warehouse.products.reduce((sum, product) => sum + (product.cost * product.quantity), 0) || 1) : 0
    };

    // User activity analytics
    const userRoles = warehouse.users.reduce((acc: any, user) => {
      if (!acc[user.role]) {
        acc[user.role] = 0;
      }
      acc[user.role]++;
      return acc;
    }, {});

    return NextResponse.json({
      warehouse: {
        ...warehouse,
        analytics: {
          totalSales,
          totalOrders,
          totalProducts,
          totalUsers,
          totalCustomers,
          totalPaid,
          totalBalance,
          avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
          lowStockCount: lowStockProducts.length
        }
      },
      monthlySalesData,
      topProducts,
      lowStockProducts,
      topCustomers,
      performanceMetrics,
      paymentAnalytics,
      inventoryAnalytics,
      userRoles,
      recentSales: warehouse.sale.slice(0, 25),
      salesTrends: {
        dailyAverage: totalOrders > 0 ? totalSales / 30 : 0, // Assuming 30 days
        weeklyTrend: monthlySalesData.slice(-4), // Last 4 weeks approximation
        bestPerformingMonth: monthlySalesData.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlySalesData[0] || {}),
        worstPerformingMonth: monthlySalesData.reduce((min, month) => month.revenue < min.revenue ? month : min, monthlySalesData[0] || {})
      }
    });
  } catch (error) {
    console.error('Error fetching warehouse detailed analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}