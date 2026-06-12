// src/context/adminStateContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/fleetSlice';
import { fetchBookings } from '../store/bookingSlice';
import { toast } from 'react-hot-toast';

const AdminOperationalContext = createContext();

export const useAdminState = () => {
  const context = useContext(AdminOperationalContext);
  if (!context) {
    throw new Error('useAdminState must be used within an AdminOperationalProvider');
  }
  return context;
};

export const AdminOperationalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { vehicles: liveVehicles } = useSelector(state => state.fleet);
  const { bookings: liveBookings } = useSelector(state => state.booking);
  const { isAuthenticated } = useSelector(state => state.auth);

  // Only fetch live data when the user is authenticated (has a valid JWT)
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchVehicles());
    dispatch(fetchBookings());
  }, [dispatch, isAuthenticated]);

  // 1. Initial State Data Maps
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    if (liveVehicles?.length > 0) {
      setVehicles(liveVehicles.map(c => ({
        ...c,
        status: c.status === 'MAINTENANCE' ? 'Maintenance' : (c.status === 'ACTIVE' ? 'Active Rental' : 'Available'),
        insuranceExpiry: '2027-04-15',
        registrationExpiry: '2027-08-30',
        vinNumber: `1FVHC8D5${c.id}209384`,
        licensePlate: `LXR-${900 + c.id}B`,
        documents: {
          insurance: `/docs/insurance_${c.id}.pdf`,
          registration: `/docs/reg_${c.id}.pdf`,
          inspectionReports: [{ date: '2026-05-10', result: 'Passed', inspector: 'Marcus Chen' }],
          maintenanceRecords: [{ date: '2026-04-12', type: 'Oil & Filter Change', cost: 350, notes: 'Completed at Bentley Beverly Hills' }]
        },
        maintenanceHistory: [
          { date: '2026-05-01', description: 'Tire rotation and calibration', status: 'Completed', cost: 180 },
          { date: '2026-05-20', description: 'Brake pad replacement', status: 'Completed', cost: 850 }
        ]
      })));
    }
  }, [liveVehicles]);

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (liveBookings?.length > 0) {
      setBookings(liveBookings.map((b, idx) => {
        const isVerified = true;
        const licenseStatus = isVerified ? 'Verified' : 'Pending Review';
        const contractStatus = isVerified ? 'Signed' : 'Draft';
        const deliveryStatus = isVerified ? 'Closed' : 'Not Scheduled';
        const status = b.status === 'ACTIVE' ? 'Active Rental' : (b.status === 'COMPLETED' ? 'Completed' : 'Pending Review');
        
        const rentalAmount = b.total_price || 0;
        const securityDeposit = 2500;
        const taxes = Math.round(rentalAmount * 0.08);
        const deliveryFee = 50;
        const grandTotal = rentalAmount + securityDeposit + taxes + deliveryFee;

        return {
          ...b,
          id: `RSV-${b.id}`,
          status,
          vehicleId: b.vehicle_id,
          vehicleName: b.vehicle?.name || 'Luxury Vehicle',
          startDate: b.start_date,
          endDate: b.end_date,
          customer: b.user?.name || 'Customer',
          totalPrice: rentalAmount,
          licenseStatus,
          contractStatus,
          deliveryStatus,
          driverId: null,
          driverName: 'Unassigned',
          inspectionOut: null,
          inspectionIn: isVerified ? { fuel: 98, mileage: 2200, damageAssessment: 'None', additionalCharges: 0 } : null,
          lastContactedDate: '2026-06-03',
          communications: [],
          timeline: [
            { date: b.created_at, title: 'Booking Initiated', desc: 'Client pre-selected vehicle details' }
          ],
          riskProfile: {
            riskLevel: 'Low',
            outstandingBalance: 0,
            damageHistory: 'None',
            blacklisted: false
          },
          paymentInfo: {
            invoiceNumber: `INV-2026-${b.id}`,
            transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            method: 'Credit Card',
            status: 'Paid',
            rentalAmount,
            securityDeposit,
            taxes,
            deliveryFee,
            grandTotal
          },
          contractTimeline: [
            { date: b.created_at, title: 'Contract Created', desc: 'System automatically drafted compact agreement' }
          ],
          paymentTimeline: [
            { date: b.created_at, title: 'Invoice Generated', desc: 'Awaiting deposit/rental funds capture' }
          ],
          deliveryInfo: {
            address: 'Beverly Hills Hub',
            scheduledDate: b.start_date ? `${b.start_date}T10:00` : '',
            driverName: 'Unassigned',
            status: deliveryStatus,
            timeline: []
          },
          activityLogs: [
            { date: b.created_at, action: 'License Approved' }
          ],
          notes: []
        };
      }));
    }
  }, [liveBookings]);

  const [customers, setCustomers] = useState([]);

  const [drivers, setDrivers] = useState([
    { 
      id: 'drv-01', 
      name: 'David Wilson', 
      phone: '(555) 321-4567', 
      email: 'david@gofintaza.com', 
      address: '128 Beverly Dr, Beverly Hills, CA',
      licenseNumber: 'DL-908234-A', 
      commercialLicenseNumber: 'CDL-40918-B',
      availability: 'Available',
      status: 'Available', 
      deliveriesCount: 2,
      joinedDate: '2025-04-12',
      rating: 4.8,
      emergencyContact: { name: 'Linda Wilson', phone: '(555) 321-9988' },
      licDocumentStatus: 'Valid',
      comDocumentStatus: 'Valid',
      insDocumentStatus: 'Valid',
      medDocumentStatus: 'Valid',
      licExpiry: '2027-05-15',
      comExpiry: '2027-10-22',
      insExpiry: '2026-12-05',
      medExpiry: '2027-02-18',
      incidents: [
        { id: 'inc-01', date: '2026-05-10', type: 'Late Arrival', severity: 'Minor', notes: 'Delayed due to severe freeway block.', resolutionStatus: 'Resolved' }
      ],
      timeline: [
        { date: '2026-06-03T10:00:00Z', title: 'Assignment Completed', desc: 'Finished delivery of Ferrari SF90' }
      ]
    },
    { 
      id: 'drv-02', 
      name: 'John Smith', 
      phone: '(555) 789-0123', 
      email: 'john@gofintaza.com', 
      address: '712 Sunset Blvd, West Hollywood, CA',
      licenseNumber: 'DL-293847-B', 
      commercialLicenseNumber: 'CDL-11928-C',
      availability: 'Available',
      status: 'Assigned', 
      deliveriesCount: 1,
      joinedDate: '2025-06-01',
      rating: 4.9,
      emergencyContact: { name: 'Jane Smith', phone: '(555) 789-1122' },
      licDocumentStatus: 'Valid',
      comDocumentStatus: 'Valid',
      insDocumentStatus: 'Expiring Soon',
      medDocumentStatus: 'Valid',
      licExpiry: '2027-09-08',
      comExpiry: '2027-03-11',
      insExpiry: '2026-07-15',
      medExpiry: '2027-01-20',
      incidents: [],
      timeline: [
        { date: '2026-06-01T14:00:00Z', title: 'Assigned To Booking', desc: 'Linked to Booking RSV-8902' }
      ]
    },
    { 
      id: 'drv-03', 
      name: 'Robert Lee', 
      phone: '(555) 654-0987', 
      email: 'robert@gofintaza.com', 
      address: '405 Wilshire Blvd, Los Angeles, CA',
      licenseNumber: 'DL-109238-C', 
      commercialLicenseNumber: 'CDL-33902-A',
      availability: 'On Leave',
      status: 'Off Duty', 
      deliveriesCount: 0,
      joinedDate: '2025-02-15',
      rating: 4.7,
      emergencyContact: { name: 'Sarah Lee', phone: '(555) 654-2211' },
      licDocumentStatus: 'Valid',
      comDocumentStatus: 'Expired',
      insDocumentStatus: 'Valid',
      medDocumentStatus: 'Valid',
      licExpiry: '2027-01-11',
      comExpiry: '2026-05-30',
      insExpiry: '2027-04-12',
      medExpiry: '2026-11-15',
      incidents: [
        { id: 'inc-02', date: '2026-04-15', type: 'Policy Violation', severity: 'Medium', notes: 'Did not record fuel level during checkout.', resolutionStatus: 'Resolved' }
      ],
      timeline: []
    },
    { 
      id: 'drv-04', 
      name: 'Sarah Miller', 
      phone: '(555) 123-8899', 
      email: 'sarah@gofintaza.com', 
      address: '902 Ocean Ave, Santa Monica, CA',
      licenseNumber: 'DL-552819-D', 
      commercialLicenseNumber: 'CDL-55218-F',
      availability: 'Suspended',
      status: 'Off Duty', 
      deliveriesCount: 3,
      joinedDate: '2024-11-20',
      rating: 4.5,
      emergencyContact: { name: 'Arthur Miller', phone: '(555) 123-9933' },
      licDocumentStatus: 'Expired',
      comDocumentStatus: 'Valid',
      insDocumentStatus: 'Valid',
      medDocumentStatus: 'Valid',
      licExpiry: '2026-05-10',
      comExpiry: '2027-04-04',
      insExpiry: '2027-08-30',
      medExpiry: '2027-06-12',
      incidents: [
        { id: 'inc-03', date: '2026-05-02', type: 'Customer Complaint', severity: 'High', notes: 'Client reported driver was speeding.', resolutionStatus: 'Resolved' }
      ],
      timeline: []
    }
  ]);

  const [contracts, setContracts] = useState(() =>
    bookings.map(b => {
      const car = vehicles.find(v => v.id === b.vehicleId);
      const isSigned = b.contractStatus === 'Signed';
      return {
        id: `CON-${b.id.split('-')[1] || b.id.split('-')[2] || Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: b.id,
        customerName: b.customer,
        customerPhone: b.phone || '(555) 332-9011',
        customerEmail: b.customerEmail || 'client@vip.com',
        customerAddress: b.pickupLocation || '1004 Beverly Hills Blvd, CA',
        vehicleName: b.vehicleName,
        vehicleCategory: car?.type || 'Electric',
        licensePlate: car?.licensePlate || 'LXR-905B',
        startDate: b.startDate,
        endDate: b.endDate,
        pricing: {
          rentalAmount: b.paymentInfo?.rentalAmount || b.totalPrice,
          securityDeposit: b.paymentInfo?.securityDeposit || 2500,
          taxes: b.paymentInfo?.taxes || Math.round(b.totalPrice * 0.08),
          deliveryFee: b.paymentInfo?.deliveryFee || 50,
          grandTotal: b.paymentInfo?.grandTotal || (b.totalPrice + 2500 + Math.round(b.totalPrice * 0.08) + 50)
        },
        status: b.contractStatus || 'Draft',
        signatureStatus: isSigned ? 'Signed' : (b.contractStatus === 'Sent' ? 'Sent' : 'Not Sent'),
        signedDate: isSigned ? '2026-06-03' : '',
        createdDate: b.createdAt.split('T')[0],
        timeline: [
          { date: b.createdAt, title: 'Contract Created' },
          ...(b.contractStatus === 'Sent' ? [{ date: '2026-06-02T11:15:00Z', title: 'Contract Sent' }] : []),
          ...(isSigned ? [{ date: '2026-06-02T11:15:00Z', title: 'Contract Sent' }, { date: '2026-06-03T10:00:00Z', title: 'Contract Signed' }] : [])
        ]
      };
    })
  );

  const [payments, setPayments] = useState(() =>
    bookings.map(b => ({
      id: `PMT-${b.id.split('-')[1] || b.id.split('-')[2] || Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: b.id,
      customerName: b.customer,
      vehicleName: b.vehicleName,
      method: b.paymentMethod || 'Credit Card',
      amount: b.paymentInfo?.rentalAmount || b.totalPrice,
      deposit: b.paymentInfo?.securityDeposit || 2500,
      grandTotal: b.paymentInfo?.grandTotal || (b.totalPrice + 2500 + Math.round(b.totalPrice * 0.08) + 50),
      status: b.paymentStatus === 'Paid' ? 'Paid' : 'Pending',
      createdDate: b.createdAt.split('T')[0]
    }))
  );

  const [invoices, setInvoices] = useState(() =>
    bookings.map(b => ({
      invoiceNumber: b.paymentInfo?.invoiceNumber || `INV-2026-${b.id.split('-')[1] || b.id.split('-')[2]}`,
      bookingId: b.id,
      customerName: b.customer,
      vehicleName: b.vehicleName,
      issueDate: b.createdAt.split('T')[0],
      dueDate: b.startDate || '2026-06-10',
      amount: b.paymentInfo?.grandTotal || (b.totalPrice + 2500 + Math.round(b.totalPrice * 0.08) + 50),
      status: b.paymentStatus === 'Paid' ? 'Paid' : 'Sent'
    }))
  );

  const [deposits, setDeposits] = useState(() =>
    bookings.map((b, idx) => ({
      id: `DEP-${b.id.split('-')[1] || b.id.split('-')[2] || Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: b.id,
      customerName: b.customer,
      vehicleName: b.vehicleName,
      amount: b.paymentInfo?.securityDeposit || 2500,
      collectedDate: b.paymentStatus === 'Paid' ? b.createdAt.split('T')[0] : '',
      status: idx === 1 ? 'Released' : (b.paymentStatus === 'Paid' ? 'Held' : 'Forfeited')
    }))
  );

  const [refunds, setRefunds] = useState([
    {
      id: 'REF-3001',
      bookingId: 'RSV-7712',
      customerName: 'James T.',
      amount: 150,
      reason: 'Service Adjustment',
      method: 'Stripe',
      createdDate: '2026-05-16',
      status: 'Completed'
    }
  ]);

  const [deliveries, setDeliveries] = useState(() =>
    bookings.map(b => ({
      id: `DEL-${b.id.split('-')[1] || Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: b.id,
      customerName: b.customer,
      vehicleName: b.vehicleName,
      address: b.pickupLocation || '1004 Beverly Hills Blvd, CA',
      driverName: b.driverName || 'Unassigned',
      status: b.deliveryStatus === 'Closed' ? 'Closed' : (b.status === 'Completed' ? 'Closed' : (b.status === 'Active Rental' ? 'Delivered' : 'Not Scheduled')),
      scheduleDate: b.startDate ? `${b.startDate} 10:00 AM` : '',
      specialInstructions: '',
      customerContact: b.phone || '(555) 332-9011',
      timeline: b.deliveryInfo?.timeline || [
        { date: b.createdAt, title: 'Booking Approved', desc: 'Lease reservation confirmed' }
      ],
      preDeliveryInspection: null,
      returnInspection: null
    }))
  );

  // Prevent double-booking / availability check
  const isVehicleAvailable = (vehicleId, start, end) => {
    const targetCar = vehicles.find(v => v.id === parseInt(vehicleId));
    if (targetCar?.status === 'Maintenance' || targetCar?.status === 'Reserved' || targetCar?.status === 'Active Rental') {
      return false;
    }
    const conflict = bookings.find(b => 
      b.vehicleId === vehicleId &&
      b.status !== 'Cancelled' &&
      b.status !== 'Completed' &&
      ((start >= b.startDate && start <= b.endDate) || 
       (end >= b.startDate && end <= b.endDate))
    );
    return !conflict;
  };

  // Log to admin activity logs
  const logActivity = (bookingId, action) => {
    const logItem = {
      date: new Date().toISOString(),
      action
    };
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, activityLogs: [logItem, ...b.activityLogs] } : b
    ));
  };

  // Create Booking
  const createBooking = (bookingData) => {
    const { vehicleId, startDate, endDate, fullName } = bookingData;
    // Check if customer is suspended
    const customerRecord = customers.find(c => c.name === fullName);
    if (customerRecord?.status === 'Suspended') {
      toast.error(`Blocked: Cannot create bookings for suspended client ${fullName}.`);
      return false;
    }

    if (!isVehicleAvailable(vehicleId, startDate, endDate)) {
      toast.error('Scheduling conflict detected: This vehicle is already reserved, active, or in maintenance.');
      return false;
    }

    const selectedCar = vehicles.find(v => v.id === parseInt(vehicleId));
    const newId = `GFR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Auto-update vehicle status to Reserved
    setVehicles(cars => cars.map(v => v.id === parseInt(vehicleId) ? { ...v, status: 'Reserved' } : v));

    const rentalAmount = selectedCar ? selectedCar.price * 3 : 1500;
    const securityDeposit = 2500;
    const taxes = Math.round(rentalAmount * 0.08);
    const deliveryFee = 50;
    const grandTotal = rentalAmount + securityDeposit + taxes + deliveryFee;

    const newBooking = {
      id: newId,
      status: 'Pending Review',
      startDate,
      endDate,
      vehicleId: parseInt(vehicleId),
      vehicleName: selectedCar?.name || 'Tesla Model S Plaid',
      image: selectedCar?.image || '',
      pickupLocation: bookingData.pickupLocation || 'Beverly Hills Hub',
      returnLocation: bookingData.returnLocation || 'Beverly Hills Hub',
      totalPrice: rentalAmount,
      paymentStatus: 'Pending',
      paymentMethod: bookingData.paymentMethod || 'Credit Card',
      customer: bookingData.fullName || 'New Client',
      customerEmail: bookingData.email || 'client@vip.com',
      createdAt: new Date().toISOString(),
      licenseStatus: 'Pending Review',
      contractStatus: 'Draft',
      deliveryStatus: 'Not Scheduled',
      driverId: null,
      driverName: 'Unassigned',
      inspectionOut: null,
      inspectionIn: null,
      lastContactedDate: new Date().toISOString().split('T')[0],
      communications: [],
      timeline: [
        { date: new Date().toISOString(), title: 'Reservation Logged', desc: 'Logged manually from executive panel' }
      ],
      riskProfile: {
        riskLevel: 'Low',
        outstandingBalance: 0,
        damageHistory: 'None',
        blacklisted: false
      },
      paymentInfo: {
        invoiceNumber: `INV-2026-${newId.split('-')[2]}`,
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        method: bookingData.paymentMethod || 'Credit Card',
        status: 'Pending',
        rentalAmount,
        securityDeposit,
        taxes,
        deliveryFee,
        grandTotal
      },
      contractTimeline: [
        { date: new Date().toISOString(), title: 'Contract Created', desc: 'System automatically drafted compact agreement' }
      ],
      paymentTimeline: [
        { date: new Date().toISOString(), title: 'Invoice Generated', desc: 'Awaiting deposit/rental funds capture' }
      ],
      deliveryInfo: {
        address: bookingData.pickupLocation || 'Beverly Hills Hub',
        scheduledDate: `${startDate}T10:00`,
        driverName: 'Unassigned',
        status: 'Not Scheduled',
        timeline: []
      },
      activityLogs: [
        { date: new Date().toISOString(), action: 'Booking Created' }
      ],
      notes: []
    };

    setBookings(prev => [newBooking, ...prev]);

    // Create draft contract
    const newContract = {
      id: `CON-${newId.split('-')[2]}`,
      bookingId: newId,
      customerName: newBooking.customer,
      customerPhone: bookingData.phone || '(555) 332-9011',
      customerEmail: newBooking.customerEmail,
      customerAddress: newBooking.pickupLocation,
      vehicleName: newBooking.vehicleName,
      vehicleCategory: selectedCar?.type || 'Electric',
      licensePlate: selectedCar?.licensePlate || 'LXR-905B',
      startDate: newBooking.startDate,
      endDate: newBooking.endDate,
      pricing: {
        rentalAmount,
        securityDeposit,
        taxes,
        deliveryFee,
        grandTotal
      },
      status: 'Draft',
      signatureStatus: 'Not Sent',
      signedDate: '',
      createdDate: new Date().toISOString().split('T')[0],
      timeline: [
        { date: new Date().toISOString(), title: 'Contract Created' }
      ]
    };
    setContracts(prev => [newContract, ...prev]);

    // Create pending payment
    const newPayment = {
      id: `PMT-${newId.split('-')[2]}`,
      bookingId: newId,
      customerName: newBooking.customer,
      vehicleName: newBooking.vehicleName,
      method: newBooking.paymentMethod,
      amount: rentalAmount,
      deposit: securityDeposit,
      grandTotal,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setPayments(prev => [newPayment, ...prev]);

    // Create invoice
    const newInvoice = {
      invoiceNumber: `INV-2026-${newId.split('-')[2]}`,
      bookingId: newId,
      customerName: newBooking.customer,
      vehicleName: newBooking.vehicleName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: startDate,
      amount: grandTotal,
      status: 'Sent'
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Create deposit record
    const newDeposit = {
      id: `DEP-${newId.split('-')[2]}`,
      bookingId: newId,
      customerName: newBooking.customer,
      vehicleName: newBooking.vehicleName,
      amount: securityDeposit,
      collectedDate: '',
      status: 'Forfeited'
    };
    setDeposits(prev => [newDeposit, ...prev]);

    // Create unscheduled delivery
    const newDelivery = {
      id: `DEL-${newId.split('-')[2]}`,
      bookingId: newId,
      customerName: newBooking.customer,
      vehicleName: newBooking.vehicleName,
      address: newBooking.pickupLocation,
      driverName: 'Unassigned',
      status: 'Not Scheduled',
      timeline: []
    };
    setDeliveries(prev => [newDelivery, ...prev]);

    toast.success(`Reservation ${newId} initiated successfully. Vehicle status set to Reserved.`);
    return true;
  };

  // License Review Workflows
  const verifyLicense = (bookingId, approve = true) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const status = approve ? 'Verified' : 'Rejected';
        const nextStatus = approve ? 'License Verified' : 'Pending Review';
        return {
          ...b,
          licenseStatus: status,
          status: nextStatus,
          timeline: [...b.timeline, { date: new Date().toISOString(), title: `License ${status}`, desc: `License status set to ${status}` }]
        };
      }
      return b;
    }));
    logActivity(bookingId, approve ? 'License Approved' : 'License Rejected');
    toast.success(`License status updated: ${approve ? 'Verified' : 'Rejected'}`);
  };

  // Contract Workflows
  const sendContract = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.licenseStatus !== 'Verified') {
      toast.error('Blocked: License verification must be approved first.');
      return;
    }

    const timestamp = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          contractStatus: 'Sent', 
          status: 'Contract Sent',
          contractTimeline: [
            ...b.contractTimeline,
            { date: timestamp, title: 'Contract Sent', desc: 'Rental compact contract sent to client email.' }
          ]
        };
      }
      return b;
    }));
    setContracts(prev => prev.map(c => 
      c.bookingId === bookingId ? {
        ...c,
        status: 'Sent',
        signatureStatus: 'Sent',
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Sent' }]
      } : c
    ));
    logActivity(bookingId, 'Contract Sent');
    toast.success('Rental compact contract sent to client email.');
  };

  const resendContract = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.licenseStatus !== 'Verified') {
      toast.error('Blocked: License verification must be approved first.');
      return;
    }
    const timestamp = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          contractTimeline: [
            ...b.contractTimeline,
            { date: timestamp, title: 'Contract Sent (Resent)', desc: 'Rental compact contract resent to client email.' }
          ]
        };
      }
      return b;
    }));
    setContracts(prev => prev.map(c => 
      c.bookingId === bookingId ? {
        ...c,
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Sent' }]
      } : c
    ));
    logActivity(bookingId, 'Contract Resent');
    toast.success('Contract resent successfully.');
  };

  const signContract = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.licenseStatus !== 'Verified') {
      toast.error('Blocked: License verification must be approved first.');
      return;
    }
    const timestamp = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          contractStatus: 'Signed', 
          status: 'Contract Signed',
          contractTimeline: [
            ...b.contractTimeline,
            { date: timestamp, title: 'Customer Signed', desc: 'Customer digital signature recorded.' }
          ]
        };
      }
      return b;
    }));
    setContracts(prev => prev.map(c => 
      c.bookingId === bookingId ? {
        ...c,
        status: 'Signed',
        signatureStatus: 'Signed',
        signedDate: timestamp.split('T')[0],
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Signed' }]
      } : c
    ));
    logActivity(bookingId, 'Contract Signed');
    toast.success('Client contract signed and logged.');
  };

  const voidContract = (bookingId) => {
    const timestamp = new Date().toISOString();
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          contractStatus: 'Draft', 
          contractTimeline: [
            ...b.contractTimeline,
            { date: timestamp, title: 'Contract Voided', desc: 'Agreement voided by administrator' }
          ]
        };
      }
      return b;
    }));
    setContracts(prev => prev.map(c => 
      c.bookingId === bookingId ? {
        ...c,
        status: 'Draft',
        signatureStatus: 'Not Sent',
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Voided' }]
      } : c
    ));
    logActivity(bookingId, 'Contract Voided');
    toast.success('Contract has been voided.');
  };

  const archiveContract = (contractId) => {
    const timestamp = new Date().toISOString();
    setContracts(prev => prev.map(c => 
      c.id === contractId ? {
        ...c,
        status: 'Archived',
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Archived' }]
      } : c
    ));
    toast.success('Contract archived.');
  };

  const restoreContract = (contractId) => {
    const timestamp = new Date().toISOString();
    setContracts(prev => prev.map(c => 
      c.id === contractId ? {
        ...c,
        status: c.signatureStatus === 'Signed' ? 'Signed' : (c.signatureStatus === 'Sent' ? 'Sent' : 'Draft'),
        timeline: [...c.timeline, { date: timestamp, title: 'Contract Restored' }]
      } : c
    ));
    toast.success('Contract restored to active list.');
  };

  // Payment Workflows
  const recordPayment = (bookingId, amount, method = 'Stripe', transactionId = '') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.licenseStatus !== 'Verified') {
      toast.error('Blocked: License verification must be approved first.');
      return;
    }

    const txn = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        // Automatically reserve vehicle
        setVehicles(cars => cars.map(v => v.id === b.vehicleId ? { ...v, status: 'Reserved' } : v));
        return {
          ...b,
          paymentStatus: 'Paid',
          status: 'Payment Completed',
          paymentInfo: {
            ...b.paymentInfo,
            status: 'Paid',
            method,
            transactionId: txn
          },
          paymentTimeline: [
            ...b.paymentTimeline,
            { date: new Date().toISOString(), title: 'Payment Settled', desc: `Captured $${amount} via ${method}. Transaction ID: ${txn}` }
          ]
        };
      }
      return b;
    }));

    setPayments(prev => prev.map(p => 
      p.bookingId === bookingId ? { ...p, status: 'Paid', amount, method, id: txn } : p
    ));

    setInvoices(prev => prev.map(inv => 
      inv.bookingId === bookingId ? { ...inv, status: 'Paid' } : inv
    ));

    setDeposits(prev => prev.map(d => 
      d.bookingId === bookingId ? { ...d, status: 'Held', collectedDate: new Date().toISOString().split('T')[0] } : d
    ));

    logActivity(bookingId, 'Payment Received');
    toast.success('Payment settled. Vehicle status synced: Reserved. Security Deposit: Held.');
  };

  const refundPayment = (bookingId, refundAmount, reason = 'Booking Cancellation', method = 'Stripe') => {
    const booking = bookings.find(b => b.id === bookingId);
    const amount = refundAmount || (booking?.paymentInfo?.grandTotal || 200);

    const refId = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRefund = {
      id: refId,
      bookingId,
      customerName: booking?.customer || 'Client',
      amount,
      reason,
      method,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Completed'
    };

    setRefunds(prev => [newRefund, ...prev]);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          paymentStatus: 'Refunded',
          paymentInfo: {
            ...b.paymentInfo,
            status: 'Refunded'
          },
          paymentTimeline: [
            ...b.paymentTimeline,
            { date: new Date().toISOString(), title: 'Payment Refunded', desc: `Refunded $${amount} via ${method}. Reason: ${reason}` }
          ]
        };
      }
      return b;
    }));

    setPayments(prev => prev.map(p => 
      p.bookingId === bookingId ? { ...p, status: 'Refunded' } : p
    ));

    setInvoices(prev => prev.map(inv => 
      inv.bookingId === bookingId ? { ...inv, status: 'Cancelled' } : inv
    ));

    logActivity(bookingId, 'Payment Refunded');
    toast.success('Payment marked as Refunded.');
  };

  const releaseDeposit = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // RULE: Deposit cannot be released unless rental is returned and inspection completed.
    if (booking.deliveryStatus !== 'Closed' || !booking.inspectionIn) {
      toast.error('Blocked: Deposit cannot be released until rental is returned and check-in inspection is complete.');
      return;
    }

    setDeposits(prev => prev.map(d => 
      d.bookingId === bookingId ? { ...d, status: 'Released' } : d
    ));

    logActivity(bookingId, 'Security Deposit Released');
    toast.success('Security deposit release authorized.');
  };

  const partialReleaseDeposit = (bookingId, releaseAmount, forfeitAmount) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.deliveryStatus !== 'Closed' || !booking.inspectionIn) {
      toast.error('Blocked: Deposit cannot be released until rental is returned and check-in inspection is complete.');
      return;
    }

    setDeposits(prev => prev.map(d => 
      d.bookingId === bookingId ? { ...d, status: 'Partially Released' } : d
    ));
    logActivity(bookingId, `Security Deposit Partially Released. Kept forfeit: $${forfeitAmount}`);
    toast.success('Security deposit partially released.');
  };

  const forfeitDeposit = (bookingId) => {
    setDeposits(prev => prev.map(d => 
      d.bookingId === bookingId ? { ...d, status: 'Forfeited' } : d
    ));
    logActivity(bookingId, 'Security Deposit Forfeited');
    toast.success('Security deposit marked as Forfeited.');
  };

  const generateInvoice = (bookingId) => {
    logActivity(bookingId, 'Invoice Generated');
    toast.success('Invoice regenerated.');
  };

  // Delivery Workflows
  const scheduleDelivery = (bookingId, address, dateTime, specialInstructions = '', customerContact = '') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.licenseStatus !== 'Verified') {
      toast.error('Blocked: License verification must be approved first.');
      return;
    }

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          deliveryStatus: 'Scheduled', 
          status: 'Delivery Scheduled',
          deliveryInfo: {
            ...b.deliveryInfo,
            address,
            status: 'Scheduled',
            scheduledDate: dateTime,
            timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Logistics Scheduled', desc: `Address: ${address}` }]
          }
        };
      }
      return b;
    }));
    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            address, 
            status: 'Scheduled', 
            scheduleDate: dateTime,
            specialInstructions,
            customerContact,
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Logistics Scheduled', desc: `Delivery scheduled to ${address} at ${dateTime}` }]
          } 
        : d
    ));
    logActivity(bookingId, 'Delivery Scheduled');
    toast.success('Lease delivery logistics scheduled.');
  };

  const assignDriver = (bookingId, driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    // RULE 4 compliance check
    if (
      driver.availability === 'On Leave' || 
      driver.availability === 'Suspended' || 
      driver.licDocumentStatus === 'Expired' || 
      driver.comDocumentStatus === 'Expired'
    ) {
      toast.error('Driver cannot be assigned until compliance requirements are resolved.');
      return;
    }

    if (driver.status !== 'Available') {
      toast.error(`Blocked: Driver ${driver.name} is ${driver.status} and cannot be assigned.`);
      return;
    }

    const timestamp = new Date().toISOString();

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          driverId, 
          driverName: driver.name, 
          status: 'Driver Assigned',
          deliveryInfo: {
            ...b.deliveryInfo,
            driverName: driver.name,
            status: 'Driver Assigned',
            timeline: [...(b.deliveryInfo.timeline || []), { date: timestamp, title: 'Driver Assigned', desc: `Driver: ${driver.name}` }]
          }
        };
      }
      return b;
    }));

    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            driverName: driver.name, 
            status: 'Driver Assigned',
            timeline: [...(d.timeline || []), { date: timestamp, title: 'Driver Assigned', desc: `VIP chauffeur ${driver.name} assigned` }]
          } 
        : d
    ));

    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { 
            ...d, 
            status: 'Assigned', 
            deliveriesCount: d.deliveriesCount + 1,
            timeline: [...(d.timeline || []), { date: timestamp, title: 'Assigned To Booking', desc: `Assigned to delivery task for Booking ${bookingId}` }]
          } 
        : d
    ));

    logActivity(bookingId, 'Driver Assigned');
    logOperationalActivity('Driver Assigned', `Chauffeur ${driver.name} assigned to booking ${bookingId}`, 'Driver');
    setNotifications(prev => [
      { id: Date.now().toString(), title: 'Driver Assigned', desc: `Chauffeur ${driver.name} assigned to dispatch file ${bookingId}`, type: 'Driver Assigned', read: false, time: 'Just now' },
      ...prev
    ]);
    toast.success(`Driver ${driver.name} assigned to delivery task.`);
  };

  const dispatchVehicle = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          deliveryStatus: 'In Transit',
          status: 'In Transit',
          deliveryInfo: {
            ...b.deliveryInfo,
            status: 'In Transit',
            timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Vehicle Dispatched', desc: 'Driver dispatched vehicle from hub' }]
          }
        };
      }
      return b;
    }));

    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            status: 'In Transit',
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Vehicle Dispatched', desc: 'Driver dispatched vehicle from showroom hub' }]
          } 
        : d
    ));

    if (booking.driverId) {
      setDrivers(prev => prev.map(d => 
        d.id === booking.driverId 
          ? { 
              ...d, 
              status: 'On Route',
              timeline: [
                ...(d.timeline || []),
                { date: new Date().toISOString(), title: 'Vehicle Picked Up', desc: `Dispatched vehicle ${booking.vehicleName} from hub` },
                { date: new Date().toISOString(), title: 'En Route', desc: 'Chauffeur is currently on route to destination' }
              ]
            } 
          : d
      ));
    }

    logActivity(bookingId, 'Vehicle Dispatched');
    logOperationalActivity('Vehicle Dispatched', `Vehicle ${booking.vehicleName} dispatched from hub.`, 'Dispatch');
    toast.success('Delivery marked In Transit. Driver is On Route.');
  };

  const markInTransit = (bookingId) => {
    dispatchVehicle(bookingId);
  };

  const markDelivered = (bookingId, handoverNotes = '') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          deliveryStatus: 'Delivered',
          status: 'Active Rental',
          deliveryInfo: {
            ...b.deliveryInfo,
            status: 'Delivered',
            timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Delivered', desc: 'Vehicle delivered to customer location' }]
          }
        };
      }
      return b;
    }));
    
    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            status: 'Delivered',
            handoverNotes,
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Vehicle Handover Confirmed', desc: `Handover notes: ${handoverNotes || 'None'}` }]
          } 
        : d
    ));
    setVehicles(cars => cars.map(v => 
      v.id === booking.vehicleId ? { ...v, status: 'Active Rental' } : v
    ));
    if (booking.driverId) {
      setDrivers(prev => prev.map(d => 
        d.id === booking.driverId 
          ? { 
              ...d, 
              status: 'Completed Assignment',
              timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Vehicle Delivered', desc: 'Chauffeur successfully delivered vehicle to customer' }]
            } 
          : d
      ));
    }
    logActivity(bookingId, 'Vehicle Delivered');
    logOperationalActivity('Vehicle Delivered', `Vehicle ${booking.vehicleName} successfully delivered to ${booking.customer}.`, 'Delivery');
    logOperationalActivity('Customer Pickup Completed', `Customer ${booking.customer} signed vehicle handover for ${booking.vehicleName}.`, 'Pickup');
    toast.success('Delivery confirmed. Vehicle is now Active Rental.');
  };

  const scheduleReturn = (bookingId, returnDate, returnLocation, driverId, returnNotes = '') => {
    const driver = drivers.find(d => d.id === driverId);
    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            status: 'Return Scheduled',
            returnDate,
            returnLocation,
            returnNotes,
            returnDriverName: driver ? driver.name : 'Unassigned',
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Return Scheduled', desc: `Return location: ${returnLocation} on ${returnDate}` }]
          } 
        : d
    ));
    if (driver) {
      setDrivers(prev => prev.map(d => 
        d.id === driverId 
          ? { 
              ...d, 
              status: 'Return Pickup',
              timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Return Pickup Assigned', desc: 'Scheduled to pick up vehicle return' }]
            } 
          : d
      ));
    }
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { 
            ...b, 
            deliveryStatus: 'Return Scheduled',
            deliveryInfo: {
              ...b.deliveryInfo,
              status: 'Return Scheduled',
              timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Return Scheduled', desc: `Return scheduled to ${returnLocation}` }]
            }
          } 
        : b
    ));
    logActivity(bookingId, 'Return Scheduled');
    logOperationalActivity('Delivery Scheduled', `Return collection scheduled for booking ${bookingId} on ${returnDate}`, 'Return');
    toast.success('Logistics return schedule saved.');
  };

  const markReturned = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          deliveryStatus: 'Returned',
          status: 'Completed',
          deliveryInfo: {
            ...b.deliveryInfo,
            status: 'Returned',
            timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Returned', desc: 'Vehicle returned and checked back in' }]
          }
        };
      }
      return b;
    }));
    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            status: 'Returned',
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Vehicle Checked In', desc: 'Return check-in completed' }]
          } 
        : d
    ));
    setVehicles(cars => cars.map(v => 
      v.id === booking.vehicleId ? { ...v, status: 'Available' } : v
    ));

    // Release check-in driver to Completed Assignment
    const deliveryRecord = deliveries.find(d => d.bookingId === bookingId);
    if (deliveryRecord && deliveryRecord.returnDriverName !== 'Unassigned') {
      const retDriver = drivers.find(d => d.name === deliveryRecord.returnDriverName);
      if (retDriver) {
        setDrivers(prev => prev.map(d => 
          d.id === retDriver.id 
            ? { 
                ...d, 
                status: 'Completed Assignment',
                timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Return Pickup Completed', desc: 'Chauffeur successfully picked up vehicle return' }]
              } 
            : d
        ));
      }
    }

    logActivity(bookingId, 'Vehicle Returned');
    logOperationalActivity('Vehicle Returned', `Vehicle ${booking.vehicleName} checked in. Status: Returned.`, 'Return');
    
    // Auto task generation on return check-in
    createTask({
      title: `Sanitize Cabin - ${booking.vehicleName}`,
      type: 'Cleaning',
      priority: 'Medium',
      vehicleId: booking.vehicleId,
      vehicleName: booking.vehicleName,
      bookingId: booking.id,
      customerName: booking.customer,
      notes: 'Auto-generated cleaning directive post-lease return check-in.'
    });

    toast.success('Vehicle return finalized. Unit back in active showroom fleet.');
  };

  const closeDelivery = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    setDeliveries(prev => prev.map(d => 
      d.bookingId === bookingId 
        ? { 
            ...d, 
            status: 'Closed',
            timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Delivery Closed', desc: 'VIP chauffeur released and deposit eligible for release' }]
          } 
        : d
    ));
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { 
            ...b, 
            deliveryStatus: 'Closed',
            deliveryInfo: {
              ...b.deliveryInfo,
              status: 'Closed',
              timeline: [...(b.deliveryInfo.timeline || []), { date: new Date().toISOString(), title: 'Delivery Closed', desc: 'Deposit marked eligible for release' }]
            }
          } 
        : b
    ));

    // Release driver back to Available
    if (booking && booking.driverId) {
      setDrivers(prev => prev.map(d => 
        d.id === booking.driverId 
          ? { 
              ...d, 
              status: 'Available',
              timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Assignment Completed', desc: 'Driver released back to availability' }]
            } 
          : d
      ));
    }
    // Also check for any return driver assigned
    const deliveryRecord = deliveries.find(d => d.bookingId === bookingId);
    if (deliveryRecord && deliveryRecord.returnDriverName !== 'Unassigned') {
      const retDriver = drivers.find(d => d.name === deliveryRecord.returnDriverName);
      if (retDriver) {
        setDrivers(prev => prev.map(d => 
          d.id === retDriver.id 
            ? { 
                ...d, 
                status: 'Available',
                timeline: [...(d.timeline || []), { date: new Date().toISOString(), title: 'Assignment Completed', desc: 'Driver released back to availability' }]
              } 
            : d
        ));
      }
    }

    logActivity(bookingId, 'Delivery Logistics Closed');
    logOperationalActivity('Return Inspection Completed', `Logistics operations file officially closed for Booking ${bookingId}`, 'Inspection');
    toast.success('Logistics file closed. Driver is back to Available.');
  };

  // Communication Timelines
  const logCommunication = (bookingId, type, content) => {
    const logItem = {
      date: new Date().toISOString(),
      type,
      content
    };

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          lastContactedDate: new Date().toISOString().split('T')[0],
          communications: [logItem, ...b.communications],
          timeline: [...b.timeline, { date: new Date().toISOString(), title: `Logged ${type}`, desc: content }]
        };
      }
      return b;
    }));
    logActivity(bookingId, `Communication logged (${type})`);
    toast.success(`Operational ${type} log added.`);
  };

  const addInternalNote = (bookingId, text, priority) => {
    const noteItem = {
      date: new Date().toISOString(),
      text,
      priority,
      type: 'Note'
    };
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          notes: [noteItem, ...b.notes]
        };
      }
      return b;
    }));
    logActivity(bookingId, `Internal Note Added (${priority})`);
    toast.success('Internal note added.');
  };

  const addFollowUpReminder = (bookingId, text, date) => {
    const reminderItem = {
      date: new Date(date).toISOString(),
      text,
      priority: 'Follow-up',
      type: 'Reminder'
    };
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          notes: [reminderItem, ...b.notes]
        };
      }
      return b;
    }));
    logActivity(bookingId, 'Follow-up Reminder Set');
    toast.success(`Follow-up reminder set for ${new Date(date).toLocaleDateString()}.`);
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Cancelled',
          deliveryStatus: 'Closed',
          contractStatus: 'Cancelled',
          deliveryInfo: {
            ...b.deliveryInfo,
            status: 'Closed'
          }
        };
      }
      return b;
    }));
    
    // Release vehicle
    setVehicles(cars => cars.map(v => v.id === booking.vehicleId ? { ...v, status: 'Available' } : v));
    
    // Release driver if assigned
    if (booking.driverId) {
      setDrivers(prev => prev.map(d => 
        d.id === booking.driverId ? { ...d, status: 'Available' } : d
      ));
    }

    logActivity(bookingId, 'Booking Cancelled');
    toast.success('Booking cancelled. Vehicle released to Available fleet.');
  };

  const completeInspection = (bookingId, type, data) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          [type === 'out' ? 'inspectionOut' : 'inspectionIn']: data,
          timeline: [...b.timeline, { 
            date: new Date().toISOString(), 
            title: `Inspection ${type.toUpperCase()} Complete`, 
            desc: type === 'out' 
              ? `Fuel: ${data.fuel}%, Mileage: ${data.mileage}mi, Damage Notes: ${data.damageNotes || 'None'}` 
              : `Fuel: ${data.fuel}%, Mileage: ${data.mileage}mi, Assessment: ${data.damageAssessment || 'None'}, Extra Charges: $${data.additionalCharges || 0}`
          }]
        };
      }
      return b;
    }));

    setDeliveries(prev => prev.map(d => {
      if (d.bookingId === bookingId) {
        const timestamp = new Date().toISOString();
        const inspector = data.inspector || 'Marcus Chen';
        if (type === 'out') {
          return {
            ...d,
            status: 'Ready For Dispatch',
            preDeliveryInspection: {
              fuelLevel: data.fuel,
              mileage: data.mileage,
              damageNotes: data.damageNotes || data.damage || 'None',
              inspectionDate: timestamp,
              inspector
            },
            timeline: [...(d.timeline || []), { date: timestamp, title: 'Vehicle Inspected', desc: `Pre-delivery check by ${inspector}: ${data.fuel}% fuel, ${data.mileage} mi` }]
          };
        } else {
          return {
            ...d,
            status: 'Returned',
            returnInspection: {
              fuelLevel: data.fuel,
              mileage: data.mileage,
              damageNotes: data.damageNotes || data.damage || 'None',
              additionalCharges: data.additionalCharges || 0,
              inspectionDate: timestamp,
              inspector
            },
            timeline: [...(d.timeline || []), { date: timestamp, title: 'Vehicle Returned', desc: `Return check-in by ${inspector}: ${data.fuel}% fuel, ${data.mileage} mi` }]
          };
        }
      }
      return d;
    }));

    // Update vehicle metrics
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setVehicles(cars => cars.map(v => 
        v.id === booking.vehicleId ? { ...v, mileage: `${data.mileage} mi`, fuel: `${data.fuel}%` } : v
      ));
    }

    logActivity(bookingId, `Inspection ${type.toUpperCase()} Complete`);
    toast.success(`Vehicle Inspection ${type === 'out' ? 'Check-out' : 'Check-in'} recorded.`);
  };

  const suspendCustomer = (customerId) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, status: 'Suspended' } : c
    ));
    toast.success('Client access suspended successfully.');
  };

  const reactivateCustomer = (customerId) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, status: 'Active' } : c
    ));
    toast.success('Client access reactivated.');
  };

  const registerDriver = (driverData) => {
    const newId = `drv-${100 + drivers.length + 1}`;
    const newChauffeur = {
      id: newId,
      ...driverData,
      availability: driverData.availability || 'Available',
      status: 'Available',
      deliveriesCount: 0,
      rating: 5.0,
      incidents: [],
      timeline: [
        { date: new Date().toISOString(), title: 'Chauffeur Registered', desc: 'Driver profile added to global roster' }
      ],
      licDocumentStatus: 'Valid',
      comDocumentStatus: 'Valid',
      insDocumentStatus: 'Valid',
      medDocumentStatus: 'Valid',
      licExpiry: '2027-12-31',
      comExpiry: '2027-12-31',
      insExpiry: '2027-12-31',
      medExpiry: '2027-12-31'
    };
    setDrivers(prev => [...prev, newChauffeur]);
    toast.success(`Chauffeur registered successfully under ${newId}.`);
  };

  const toggleDriverAvailability = (driverId, nextAvailability) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        toast.success(`Chauffeur ${d.name} availability is now ${nextAvailability}.`);
        return { ...d, availability: nextAvailability };
      }
      return d;
    }));
  };

  // Vehicle actions for Central State Sync
  const addVehicle = (newCar) => {
    setVehicles(prev => [newCar, ...prev]);
  };
  const editVehicle = (updatedCar) => {
    setVehicles(prev => prev.map(v => v.id === updatedCar.id ? { ...v, ...updatedCar } : v));
  };
  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };
  const updateVehicleStatus = (id, status) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  // ==========================================
  // CENTRALIZED ENTERPRISE OPERATIONS MODULES
  // ==========================================
  
  // Current active operations role (defaulting to 'Operations Manager')
  const [currentOperationsRole, setOperationsRole] = useState('Operations Manager');

  // Role permissions map for front-end RBAC enforcement
  const rolePermissions = {
    'Operations Manager': ['Full access', 'Create/Edit/Delete', 'Incident closure', 'Maintenance approval', 'Assign Driver', 'Schedule Delivery', 'Schedule Return', 'View Fleet', 'Vehicle Readiness', 'Vehicle Inspection', 'Fleet Status Updates', 'Driver Assignment', 'Driver Availability', 'Driver Performance', 'Maintenance Scheduling', 'Maintenance Completion', 'Service Logs', 'View Assigned Tasks', 'Update Task Status', 'Complete Tasks'],
    'Dispatcher': ['Assign Driver', 'Schedule Delivery', 'Schedule Return', 'View Fleet', 'View Assigned Tasks', 'Update Task Status', 'Complete Tasks'],
    'Fleet Coordinator': ['Vehicle Readiness', 'Vehicle Inspection', 'Fleet Status Updates', 'View Fleet', 'View Assigned Tasks', 'Update Task Status', 'Complete Tasks'],
    'Driver Supervisor': ['Driver Assignment', 'Driver Availability', 'Driver Performance', 'View Fleet', 'View Assigned Tasks', 'Update Task Status', 'Complete Tasks'],
    'Maintenance Coordinator': ['Maintenance Scheduling', 'Maintenance Completion', 'Service Logs', 'View Fleet', 'View Assigned Tasks', 'Update Task Status', 'Complete Tasks'],
    'Operations Staff': ['View Assigned Tasks', 'Update Task Status', 'Complete Tasks', 'View Fleet']
  };

  const hasOperationalPermission = (permission) => {
    const allowed = rolePermissions[currentOperationsRole] || [];
    return allowed.includes(permission) || allowed.includes('Full access');
  };

  // Central Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 'TSK-101',
      title: 'Sanitize Cabin & Restock',
      type: 'Cleaning',
      priority: 'High',
      assignee: 'Alex R.',
      status: 'In Progress',
      dueDate: '14:30',
      vehicleId: 4,
      vehicleName: 'Lucid Air GT',
      bookingId: 'RSV-8902',
      customerName: 'Elena R.',
      notes: 'Full interior sanitation required. Restock water bottles and mints.',
      proofRequired: true,
      completionDate: '',
      timeline: [
        { date: '2026-06-09T10:00:00Z', title: 'Task Initialized', desc: 'Task generated automatically for check-in preparation' },
        { date: '2026-06-09T10:15:00Z', title: 'Assigned to Alex R.', desc: 'Alex R. accepted the cleaning dispatch' }
      ],
      attachments: []
    },
    {
      id: 'TSK-102',
      title: 'Tire Pressure & Alignment',
      type: 'Maintenance',
      priority: 'Medium',
      assignee: 'Unassigned',
      status: 'Pending',
      dueDate: '16:00',
      vehicleId: 1,
      vehicleName: 'Model S Plaid',
      bookingId: 'RSV-7712',
      customerName: 'James T.',
      notes: 'Check PSI on all tires. Perform alignment check if needed.',
      proofRequired: false,
      completionDate: '',
      timeline: [
        { date: '2026-06-09T10:00:00Z', title: 'Task Initialized', desc: 'Awaiting coordinator assignment' }
      ],
      attachments: []
    }
  ]);

  // Chronological operational activity log
  const [activities, setActivities] = useState([
    { id: 1, date: '2026-06-09T11:45:00Z', title: 'Inspection Completed', desc: 'Pre-delivery inspection completed for Lucid Air GT', category: 'Inspection' },
    { id: 2, date: '2026-06-09T11:30:00Z', title: 'Driver Assigned', desc: 'Driver David Wilson assigned to Booking RSV-8902', category: 'Driver' },
    { id: 3, date: '2026-06-09T10:00:00Z', title: 'Delivery Scheduled', desc: 'Delivery scheduled for Rivian R1S', category: 'Delivery' }
  ]);

  const logOperationalActivity = (title, desc, category) => {
    const newAct = {
      id: Date.now(),
      date: new Date().toISOString(),
      title,
      desc,
      category
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Central Incidents State
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-101',
      vehicle: 'Bentley Continental',
      driver: 'David Wilson',
      customer: 'Elena R.',
      type: 'Late Return',
      severity: 'Medium',
      description: 'Bentley Continental unit delayed over 45 minutes due to heavy local traffic.',
      createdBy: 'David Wilson',
      createdDate: '2026-06-09',
      status: 'Resolved'
    },
    {
      id: 'INC-102',
      vehicle: 'Tesla Model S Plaid',
      driver: 'John Smith',
      customer: 'James T.',
      type: 'Vehicle Damage',
      severity: 'High',
      description: 'Minor scuff detected on front passenger rim post-delivery.',
      createdBy: 'Marcus Chen',
      createdDate: '2026-06-08',
      status: 'Under Investigation'
    }
  ]);

  // Central Maintenance State
  const [maintenance, setMaintenance] = useState([
    {
      id: 'MNT-101',
      vehicleId: 6,
      vehicleName: 'Bentley Continental',
      type: 'Routine Alignment',
      description: 'Standard multi-point alignment and recalibration.',
      cost: 450,
      scheduledDate: '2026-06-12',
      completionDate: '',
      status: 'Scheduled',
      notes: 'Booked at local Bentley service hub.'
    },
    {
      id: 'MNT-102',
      vehicleId: 3,
      vehicleName: 'Rivian R1S',
      type: 'Annual Battery Checkup',
      description: 'Battery management module diagnostic check.',
      cost: 200,
      scheduledDate: '2026-06-05',
      completionDate: '2026-06-05',
      status: 'Completed',
      notes: 'Battery health verified at 99.4% efficiency.'
    }
  ]);

  // Functional notification alerts
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Driver Late', desc: 'Driver John Smith is 15 mins overdue for pickup', type: 'Driver Late', read: false, time: '10 mins ago' },
    { id: 'notif-2', title: 'Maintenance Due', desc: 'Bentley Continental is scheduled for alignment tomorrow', type: 'Maintenance Due', read: false, time: '1 hour ago' }
  ]);

  // Tasks actions
  const createTask = (taskData) => {
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Blocked: Insufficient permissions for creating tasks.');
      return;
    }
    const newId = `TSK-${100 + tasks.length + 1}`;
    const newTask = {
      id: newId,
      title: taskData.title,
      type: taskData.type,
      priority: taskData.priority || 'Medium',
      assignee: taskData.assignee || 'Unassigned',
      status: taskData.assignee ? 'Assigned' : 'Pending',
      dueDate: taskData.dueDate || '18:00',
      vehicleId: taskData.vehicleId || null,
      vehicleName: taskData.vehicleName || 'N/A',
      bookingId: taskData.bookingId || 'N/A',
      customerName: taskData.customerName || 'N/A',
      notes: taskData.notes || '',
      proofRequired: taskData.proofRequired || false,
      completionDate: '',
      timeline: [
        { date: new Date().toISOString(), title: 'Task Initialized', desc: `Task created under category: ${taskData.type}` }
      ],
      attachments: []
    };
    setTasks(prev => [newTask, ...prev]);
    logOperationalActivity('Create Task', `New operational task ${newId} created: ${taskData.title}`, 'Tasks');
    toast.success(`Task ${newId} created successfully.`);
  };

  const assignTask = (taskId, staffName) => {
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Blocked: Insufficient permissions to assign task.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          assignee: staffName,
          status: 'Assigned',
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Assigned', desc: `Assigned to ${staffName}` }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Assigned', `Task ${taskId} assigned to ${staffName}`, 'Tasks');
    toast.success(`Task ${taskId} assigned to ${staffName}.`);
  };

  const startTask = (taskId) => {
    if (!hasOperationalPermission('Update Task Status') && !hasOperationalPermission('Complete Tasks')) {
      toast.error('Blocked: Insufficient permissions to start tasks.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'In Progress',
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Started', desc: 'Task execution started.' }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Started', `Task ${taskId} is now In Progress.`, 'Tasks');
    toast.success(`Task ${taskId} started.`);
  };

  const updateTaskStatus = (taskId, nextStatus) => {
    if (!hasOperationalPermission('Update Task Status') && !hasOperationalPermission('Complete Tasks')) {
      toast.error('Blocked: Insufficient permissions to modify tasks.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: nextStatus,
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Status Updated', desc: `Status changed to ${nextStatus}` }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Updated', `Task ${taskId} status changed to ${nextStatus}.`, 'Tasks');
    toast.success(`Task ${taskId} status updated.`);
  };

  const completeTask = (taskId, proofData = null) => {
    if (!hasOperationalPermission('Complete Tasks')) {
      toast.error('Blocked: Insufficient permissions to complete tasks.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.proofRequired ? 'Waiting Approval' : 'Completed';
        return {
          ...t,
          status: nextStatus,
          completionDate: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : '',
          attachments: proofData ? [proofData] : t.attachments,
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Completed', desc: t.proofRequired ? 'Awaiting supervisor approval of uploaded proof' : 'Task finalized and closed' }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Updated', `Task ${taskId} status moved to check-off stage.`, 'Tasks');
    toast.success(`Task ${taskId} updated.`);
  };

  const approveTask = (taskId) => {
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Blocked: Insufficient permissions to approve tasks.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Completed',
          completionDate: new Date().toISOString().split('T')[0],
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Approved', desc: 'Completion proof verified by manager' }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Approved', `Task ${taskId} approved and officially closed.`, 'Tasks');
    toast.success(`Task ${taskId} approved.`);
  };

  const cancelTask = (taskId) => {
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Blocked: Insufficient permissions to cancel tasks.');
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Cancelled',
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Cancelled', desc: 'Cancelled by operations management' }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Cancelled', `Task ${taskId} cancelled.`, 'Tasks');
    toast.success(`Task ${taskId} marked as Cancelled.`);
  };

  const escalateTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Escalated',
          priority: 'Critical',
          timeline: [...t.timeline, { date: new Date().toISOString(), title: 'Task Escalated', desc: 'Escalated to critical queue due to delay.' }]
        };
      }
      return t;
    }));
    logOperationalActivity('Task Escalated', `Task ${taskId} escalated to CRITICAL priority.`, 'Tasks');
    // Add incident automatic logging on escalation
    createIncident({
      vehicle: 'N/A',
      driver: 'N/A',
      customer: 'N/A',
      type: 'Mechanical Issue',
      severity: 'High',
      description: `Task ${taskId} escalated: Critical issue requiring manager attention.`
    });
    toast.error(`Task ${taskId} escalated to Critical list.`);
  };

  // Incident actions
  const createIncident = (incidentData) => {
    const newId = `INC-${100 + incidents.length + 1}`;
    const newInc = {
      id: newId,
      vehicle: incidentData.vehicle || 'N/A',
      driver: incidentData.driver || 'N/A',
      customer: incidentData.customer || 'N/A',
      type: incidentData.type || 'Mechanical Issue',
      severity: incidentData.severity || 'Medium',
      description: incidentData.description || '',
      createdBy: currentOperationsRole,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Open'
    };
    setIncidents(prev => [newInc, ...prev]);
    logOperationalActivity('Incident Logged', `Incident ${newId} (${incidentData.type}) created.`, 'Incidents');
    setNotifications(prev => [
      { id: Date.now().toString(), title: 'Incident Created', desc: `${incidentData.type} reported under ${newId}`, type: 'Incident Created', read: false, time: 'Just now' },
      ...prev
    ]);
    toast.error(`Incident ${newId} logged.`);
  };

  const updateIncidentStatus = (incidentId, nextStatus) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, status: nextStatus } : inc
    ));
    logOperationalActivity('Incident Updated', `Incident ${incidentId} status set to ${nextStatus}.`, 'Incidents');
    toast.success(`Incident ${incidentId} set to ${nextStatus}.`);
  };

  const closeIncident = (incidentId) => {
    if (!hasOperationalPermission('Incident closure')) {
      toast.error('Blocked: Insufficient permissions to close incidents.');
      return;
    }
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, status: 'Closed' } : inc
    ));
    logOperationalActivity('Incident Closed', `Incident ${incidentId} resolved and officially closed.`, 'Incidents');
    toast.success(`Incident ${incidentId} closed.`);
  };

  // Maintenance actions
  const scheduleMaintenance = (vehicleId, type, description, cost = 150) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const newId = `MNT-${100 + maintenance.length + 1}`;
    const newMnt = {
      id: newId,
      vehicleId,
      vehicleName: vehicle.name,
      type,
      description,
      cost,
      scheduledDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      status: 'Scheduled',
      notes: ''
    };
    setMaintenance(prev => [newMnt, ...prev]);
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'Maintenance' } : v));
    
    // Add to vehicle maintenance history
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: [
            { date: newMnt.scheduledDate, description: `${type}: ${description}`, status: 'Scheduled', cost },
            ...(v.maintenanceHistory || [])
          ]
        };
      }
      return v;
    }));

    logOperationalActivity('Maintenance Scheduled', `Maintenance scheduled for ${vehicle.name} (${newId})`, 'Maintenance');
    toast.success(`Maintenance ${newId} scheduled for ${vehicle.name}.`);
  };

  const startMaintenance = (mntId) => {
    setMaintenance(prev => prev.map(mnt => {
      if (mnt.id === mntId) {
        setVehicles(cars => cars.map(v => v.id === mnt.vehicleId ? { ...v, status: 'Maintenance' } : v));
        return { ...mnt, status: 'In Workshop' };
      }
      return mnt;
    }));
    logOperationalActivity('Maintenance Started', `Vehicle workshop entry recorded for ${mntId}`, 'Maintenance');
    toast.success('Vehicle moved to workshop floor.');
  };

  const completeMaintenance = (mntId) => {
    if (!hasOperationalPermission('Maintenance Completion')) {
      toast.error('Blocked: Insufficient permissions to sign off maintenance.');
      return;
    }
    setMaintenance(prev => prev.map(mnt => {
      if (mnt.id === mntId) {
        setVehicles(cars => cars.map(v => v.id === mnt.vehicleId ? { ...v, status: 'Available' } : v));
        return { 
          ...mnt, 
          status: 'Completed', 
          completionDate: new Date().toISOString().split('T')[0] 
        };
      }
      return mnt;
    }));
    logOperationalActivity('Maintenance Completed', `Vehicle returned to fleet post-service (${mntId})`, 'Maintenance');
    toast.success('Maintenance completed. Vehicle returned to fleet.');
  };

  // --- DRIVER PORTAL ACTIONS ---
  const updateDriverAvailability = (driverId, status) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status, availability: status } : d));
    toast.success(`Driver status updated to ${status}`);
    logOperationalActivity('Driver Status Updated', `Driver ${driverId} status is now ${status}`, 'Driver');
  };

  // Re-export as updateDriverStatus for backwards compatibility if needed, or just map it
  const updateDriverStatus = updateDriverAvailability;

  const logDriverActivity = (driverId, title, desc) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return { ...d, timeline: [...(d.timeline||[]), { date: new Date().toISOString(), title, desc }] };
      }
      return d;
    }));
  };

  const acceptAssignment = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;
    
    const timestamp = new Date().toISOString();
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'Accepted', timeline: [...(d.timeline||[]), { date: timestamp, title: 'Assignment Accepted', desc: 'Driver accepted the assignment' }] } : d));
    
    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      deliveryStatus: 'Accepted',
      activityLogs: [{ date: timestamp, action: 'Driver Accepted Assignment' }, ...b.activityLogs]
    } : b));
    
    // Log for driver timeline if we know the driver
    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) logDriverActivity(driver.id, 'Assignment Accepted', `Accepted trip ${deliveryId}`);
    
    logOperationalActivity('Assignment Accepted', `Driver accepted assignment for ${deliveryId}`, 'Dispatch');
    toast.success('Assignment Accepted');
  };

  const rejectAssignment = (deliveryId, reason = 'Other') => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if(!delivery) return;
    
    const timestamp = new Date().toISOString();
    
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { 
      ...d, 
      status: 'Scheduled', 
      driverName: 'Unassigned', 
      timeline: [...(d.timeline||[]), { date: timestamp, title: 'Assignment Rejected', desc: `Driver rejected assignment. Reason: ${reason}` }] 
    } : d));
    
    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      driverId: null, 
      driverName: 'Unassigned', 
      status: 'Delivery Scheduled',
      activityLogs: [{ date: timestamp, action: `Driver Rejected Assignment - ${reason}` }, ...b.activityLogs]
    } : b));

    // Free up driver
    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) {
      logDriverActivity(driver.id, 'Assignment Rejected', `Rejected trip ${deliveryId}. Reason: ${reason}`);
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status: 'Available' } : d));
    }
    
    logOperationalActivity('Assignment Rejected', `Driver rejected assignment ${deliveryId}. Reason: ${reason}`, 'Dispatch');
    toast.error('Assignment Rejected');
  };

  const startNavigation = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;
    
    const timestamp = new Date().toISOString();
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'En Route', timeline: [...(d.timeline||[]), { date: timestamp, title: 'En Route', desc: 'Driver started navigation' }] } : d));
    
    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      deliveryStatus: 'En Route',
      activityLogs: [{ date: timestamp, action: 'Driver Started Navigation' }, ...b.activityLogs]
    } : b));
    
    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) logDriverActivity(driver.id, 'Navigation Started', `En Route to pickup for trip ${deliveryId}`);

    logOperationalActivity('Navigation Started', `Driver is en route for ${deliveryId}`, 'Delivery');
    toast.success('Navigation Started');
  };

  const markArrived = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;
    
    const timestamp = new Date().toISOString();
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'Arrived', timeline: [...(d.timeline||[]), { date: timestamp, title: 'Arrived', desc: 'Driver arrived at location' }] } : d));
    
    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      deliveryStatus: 'Arrived',
      activityLogs: [{ date: timestamp, action: 'Driver Arrived At Pickup' }, ...b.activityLogs]
    } : b));
    
    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) logDriverActivity(driver.id, 'Arrived', `Arrived at location for trip ${deliveryId}`);

    logOperationalActivity('Driver Arrived', `Driver arrived at location for ${deliveryId}`, 'Delivery');
    toast.success('Marked as Arrived');
  };

  const submitInspection = (deliveryId, inspectionData, type = 'pickup') => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if(!delivery) return;
    
    const timestamp = new Date().toISOString();
    completeInspection(delivery.bookingId, type === 'pickup' ? 'out' : 'in', inspectionData);
    
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'Inspection Complete', timeline: [...(d.timeline||[]), { date: timestamp, title: 'Inspection Complete', desc: 'Driver completed the vehicle inspection' }] } : d));

    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      deliveryStatus: 'Inspection Complete',
      activityLogs: [{ date: timestamp, action: 'Inspection Completed' }, ...b.activityLogs]
    } : b));

    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) logDriverActivity(driver.id, 'Inspection Completed', `Completed ${type} inspection for ${deliveryId}`);

    logOperationalActivity('Inspection Completed', `Inspection for ${deliveryId} completed by driver`, 'Inspection');
  };

  const uploadInspectionPhotos = (deliveryId, photos) => {
    // Mocking photo upload
    toast.success('Inspection photos uploaded successfully.');
    logOperationalActivity('Photos Uploaded', `Evidence photos uploaded for ${deliveryId}`, 'Inspection');
  };

  const startTrip = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    const timestamp = new Date().toISOString();
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'Trip Active', timeline: [...(d.timeline||[]), { date: timestamp, title: 'Trip Started', desc: 'Driver started the trip' }] } : d));
    
    setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
      ...b, 
      deliveryStatus: 'Trip Active',
      activityLogs: [{ date: timestamp, action: 'Trip Started' }, ...b.activityLogs]
    } : b));

    const driver = drivers.find(d => d.name === delivery.driverName);
    if (driver) logDriverActivity(driver.id, 'Trip Started', `Trip ${deliveryId} is now active`);

    logOperationalActivity('Trip Started', `Trip ${deliveryId} is now active`, 'Delivery');
    toast.success('Trip Started');
  };

  const completeTrip = (deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if(delivery) {
      const timestamp = new Date().toISOString();
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'Completed', timeline: [...(d.timeline||[]), { date: timestamp, title: 'Trip Completed', desc: 'Driver completed the trip' }] } : d));
      markDelivered(delivery.bookingId);
      
      setBookings(prev => prev.map(b => b.id === delivery.bookingId ? { 
        ...b, 
        deliveryStatus: 'Completed',
        activityLogs: [{ date: timestamp, action: 'Trip Completed' }, ...b.activityLogs]
      } : b));

      const driver = drivers.find(d => d.name === delivery.driverName);
      if (driver) {
        logDriverActivity(driver.id, 'Trip Completed', `Successfully completed trip ${deliveryId}`);
        // Free up driver
        setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status: 'Available' } : d));
      }

      logOperationalActivity('Trip Completed', `Driver completed trip ${deliveryId}`, 'Delivery');
    }
  };

  return (
    <AdminOperationalContext.Provider value={{
      vehicles,
      bookings,
      customers,
      drivers,
      contracts,
      payments,
      invoices,
      deposits,
      refunds,
      deliveries,
      createBooking,
      verifyLicense,
      sendContract,
      resendContract,
      signContract,
      voidContract,
      archiveContract,
      restoreContract,
      recordPayment,
      refundPayment,
      releaseDeposit,
      partialReleaseDeposit,
      forfeitDeposit,
      generateInvoice,
      scheduleDelivery,
      assignDriver,
      markInTransit,
      dispatchVehicle,
      markDelivered,
      scheduleReturn,
      markReturned,
      closeDelivery,
      logCommunication,
      addInternalNote,
      addFollowUpReminder,
      cancelBooking,
      completeInspection,
      suspendCustomer,
      reactivateCustomer,
      registerDriver,
      toggleDriverAvailability,
      addVehicle,
      editVehicle,
      deleteVehicle,
      updateVehicleStatus,
      
      // Central operational modules
      tasks,
      setTasks,
      activities,
      logOperationalActivity,
      incidents,
      maintenance,
      notifications,
      setNotifications,
      currentOperationsRole,
      setOperationsRole,
      hasOperationalPermission,
      
      createTask,
      assignTask,
      startTask,
      updateTaskStatus,
      completeTask,
      cancelTask,
      approveTask,
      escalateTask,
      createIncident,
      updateIncidentStatus,
      closeIncident,
      scheduleMaintenance,
      startMaintenance,
      completeMaintenance,
      
      // Driver Portal exports
      updateDriverStatus,
      updateDriverAvailability,
      acceptAssignment,
      rejectAssignment,
      startNavigation,
      markArrived,
      startTrip,
      completeTrip,
      submitInspection,
      uploadInspectionPhotos,
      logDriverActivity
    }}>
      {children}
    </AdminOperationalContext.Provider>
  );
};

