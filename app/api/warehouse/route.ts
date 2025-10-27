import { PrismaClient } from "@/prisma/generated/online";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET(){
   try {
    const warehouses = await prisma.warehouses_online.findMany({
      where:{isDeleted:false},
      include: {
        users: {
          where: { isDeleted: false },
          select: {
            id: true,
            userName: true,
            email: true,
            role: true,
            lastLogin: true
          }
        },
        products: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            quantity: true,
            retailPrice: true
          }
        },
        sale: {
          where: { isDeleted: false },
          select: {
            id: true,
            grandTotal: true,
            createdAt: true
          }
        },
        customer: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Calculate analytics for each warehouse
    const warehousesWithStats = warehouses.map(warehouse => {
      const totalSales = warehouse.sale.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      const totalOrders = warehouse.sale.length;
      const totalProducts = warehouse.products.length;
      const totalUsers = warehouse.users.length;
      const totalCustomers = warehouse.customer.length;
      const lowStockProducts = warehouse.products.filter(product => product.quantity <= 10).length;
      const inventoryValue = warehouse.products.reduce((sum, product) => sum + (product.retailPrice * product.quantity), 0);

      return {
        ...warehouse,
        stats: {
          totalSales,
          totalOrders,
          totalProducts,
          totalUsers,
          totalCustomers,
          lowStockProducts,
          inventoryValue,
          avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
        }
      };
    });

    return NextResponse.json(warehousesWithStats, {status:200})
   } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({
      error: 'Failed to fetch warehouses',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {status:500})
   }finally{
    await prisma.$disconnect()
   }
}

export async function POST(req:NextRequest){
    try {
      const data = await req.json()
      const {code,name,phone,email,description,address} = data.formData

      // Validation
      if (!name || !code || !phone || !email || !address) {
        return NextResponse.json({
          error: 'Missing required fields',
          message: 'Name, code, phone, email, and address are required'
        }, {status:400})
      }

      // Check if warehouse code already exists
      const existingWarehouse = await prisma.warehouses_online.findUnique({
        where: { warehouseCode: code, isDeleted: false }
      });

      if (existingWarehouse) {
        return NextResponse.json({
          error: 'Warehouse code already exists',
          message: 'A warehouse with this code already exists'
        }, {status:409})
      }

      // Create warehouse
      const warehouse = await prisma.warehouses_online.create({
        data:{
            name: name.trim(),
            warehouseCode: code.trim().toUpperCase(),
            phoneNumber: phone.trim(),
            email: email.trim().toLowerCase(),
            description: description?.trim() || '',
            address: address.trim()
        }
      })

      // Create default receipt settings
      await prisma.receiptSettings_online.create({
        data:{
            warehouses_onlineId: warehouse.warehouseCode,
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            state: "",
            country: "",
            city: "",
            companyName: "Change",
            businessName: warehouse.name,
            website: `${warehouse.warehouseCode.toLowerCase()}.com`,
            address: address.trim(),
        }
      })

      return NextResponse.json({
        message: 'Warehouse created successfully',
        warehouse
      }, {status:201})
    } catch (error) {
      console.error('Error creating warehouse:', error);
      return NextResponse.json({
        error: 'Failed to create warehouse',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, {status:500})
    }finally{
      await prisma.$disconnect()
    }
}

export async function PUT(req:NextRequest){
    try {
      const data = await req.json()
      const {warehouseCode,name,phoneNumber,email,description,address} = data

      // Validation
      if (!warehouseCode || !name || !phoneNumber || !email || !address) {
        return NextResponse.json({
          error: 'Missing required fields',
          message: 'Warehouse code, name, phone, email, and address are required'
        }, {status:400})
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        }, {status:400})
      }

      // Check if warehouse exists
      const existingWarehouse = await prisma.warehouses_online.findUnique({
        where: { warehouseCode, isDeleted: false }
      });

      if (!existingWarehouse) {
        return NextResponse.json({
          error: 'Warehouse not found',
          message: 'The warehouse you are trying to update does not exist'
        }, {status:404})
      }

      // Update warehouse
      const updatedWarehouse = await prisma.warehouses_online.update({
        where:{
            warehouseCode,
            isDeleted: false
        },
        data:{
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim().toLowerCase(),
            description: description?.trim() || '',
            address: address.trim(),
            updatedAt: new Date()
        },
        include: {
          users: {
            where: { isDeleted: false },
            select: {
              id: true,
              userName: true,
              email: true,
              role: true
            }
          },
          products: {
            where: { isDeleted: false },
            select: {
              id: true,
              name: true,
              quantity: true
            }
          }
        }
      })

      // Update receipt settings if they exist
      await prisma.receiptSettings_online.updateMany({
        where: { warehouses_onlineId: warehouseCode },
        data: {
          phone: phoneNumber.trim(),
          email: email.trim().toLowerCase(),
          businessName: name.trim(),
          address: address.trim(),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Warehouse updated successfully',
        warehouse: updatedWarehouse
      }, {status:200})
    } catch (error) {
      console.error('Error updating warehouse:', error);
      return NextResponse.json({
        error: 'Failed to update warehouse',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, {status:500})
    }finally{
      await prisma.$disconnect()
    }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseCode = searchParams.get('code');

    if (!warehouseCode) {
      return NextResponse.json({
        error: 'Missing warehouse code',
        message: 'Warehouse code is required for deletion'
      }, {status:400})
    }

    // Check if warehouse exists and has dependencies
    const warehouse = await prisma.warehouses_online.findUnique({
      where: { warehouseCode, isDeleted: false },
      include: {
        users: { where: { isDeleted: false } },
        products: { where: { isDeleted: false } },
        sale: { where: { isDeleted: false } }
      }
    });

    if (!warehouse) {
      return NextResponse.json({
        error: 'Warehouse not found',
        message: 'The warehouse you are trying to delete does not exist'
      }, {status:404})
    }

    // Check for dependencies
    if (warehouse.users.length > 0 || warehouse.products.length > 0 || warehouse.sale.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete warehouse',
        message: 'Warehouse has associated users, products, or sales. Please remove these first.'
      }, {status:409})
    }

    // Soft delete the warehouse
    await prisma.warehouses_online.update({
      where: { warehouseCode },
      data: { 
        isDeleted: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Warehouse deleted successfully'
    }, {status:200})
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return NextResponse.json({
      error: 'Failed to delete warehouse',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {status:500})
  } finally {
    await prisma.$disconnect()
  }
}