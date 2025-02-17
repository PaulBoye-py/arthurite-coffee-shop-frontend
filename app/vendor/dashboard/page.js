"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import Link from "next/link";
import Modal from "@/components/Modal";

export default function VendorDashboard() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This data would come from your API in a real application
  const dashboardData = {
    totalOrders: 150,
    pendingOrders: 10,
    completedOrders: 140,
    earnings: 2500,
  };

  const vendorID =
    typeof window !== "undefined" ? window.localStorage.getItem("id") : null;

  const checkLocalStorage = useCallback(() => {
    const requiredItems = ["token", "email", "name", "id"];
    for (const item of requiredItems) {
      if (!localStorage.getItem(item)) {
        router.push("/vendor/login");
        return false;
      }
    }
    return true;
  }, [router]);

  const getEmailVerificationStatus = useCallback(() => {
    if (!checkLocalStorage()) return;

    const config = {
      method: "get",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: "/api/get-vendor-ses",
      headers: {
        "Content-Type": "application/json",
        "vendor-id": vendorID,
      },
    };

    axios
      .request(config)
      .then((res) => {
        if (res.status === 200) {
          setVerificationStatus(res.data.data.verificationStatus);
          if (res.data.data.verificationStatus === "Pending") {
            setIsModalOpen(true);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching email verification status:", error);
        setVerificationStatus("Error");
        setIsModalOpen(true);
      });
  }, [vendorID, checkLocalStorage]);

  useEffect(() => {
    getEmailVerificationStatus();
  }, [getEmailVerificationStatus]);

  if (verificationStatus !== "Success") {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-[#19381f] mb-8">
            Vendor Dashboard
          </h1>
          <p>Please verify your email to access the dashboard.</p>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">
            Email Verification Required
          </h2>
          <p>
            {verificationStatus === "Pending"
              ? "Please check your email and verify your account to access the dashboard."
              : "There was an error verifying your email. Please try again later or contact support."}
          </p>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-[#19381f] mb-8">
          Vendor Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Orders"
            value={dashboardData.totalOrders}
          />
          <DashboardCard
            title="Pending Orders"
            value={dashboardData.pendingOrders}
          />
          <DashboardCard
            title="Completed Orders"
            value={dashboardData.completedOrders}
          />
          <DashboardCard
            title="Earnings"
            value={`$${dashboardData.earnings}`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/vendor/orders"
            className="bg-[#19381f] text-white p-4 rounded text-center hover:bg-[#19381f]/80"
          >
            Manage Orders
          </Link>
          <Link
            href="/vendor/menu"
            className="bg-[#19381f] text-white p-4 rounded text-center hover:bg-[#19381f]/80"
          >
            Manage Menu
          </Link>
          <Link
            href="/vendor/account"
            className="bg-[#19381f] text-white p-4 rounded text-center hover:bg-[#19381f]/80"
          >
            Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold text-[#19381f]">{value}</p>
    </div>
  );
}
