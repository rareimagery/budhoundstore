import { useState, useCallback } from "react";
import client from "../api/commerceClient";
import { useCartContext } from "../context/CartContext";

const INITIAL_STATE = {
  step: "information", // information -> review -> complete
  customerInfo: {
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "CA",
      zip: "",
      country: "US",
    },
  },
  orderNotes: "",
};

/**
 * Multi-step Cash on Delivery checkout hook.
 */
export function useCheckout() {
  const { cart, dispatch } = useCartContext();
  const [checkout, setCheckout] = useState(INITIAL_STATE);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const updateCustomerInfo = useCallback((field, value) => {
    setCheckout((prev) => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [field]: value },
    }));
  }, []);

  const updateAddress = useCallback((field, value) => {
    setCheckout((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        address: { ...prev.customerInfo.address, [field]: value },
      },
    }));
  }, []);

  const updateOrderNotes = useCallback((value) => {
    setCheckout((prev) => ({ ...prev, orderNotes: value }));
  }, []);

  const goToStep = useCallback((step) => {
    setCheckout((prev) => ({ ...prev, step }));
    setError(null);
  }, []);

  const saveCustomerInfo = useCallback(async () => {
    const { customerInfo } = checkout;
    const { address } = customerInfo;

    if (!customerInfo.email) {
      setError("Email address is required.");
      return;
    }
    if (!customerInfo.firstName || !customerInfo.lastName) {
      setError("First and last name are required.");
      return;
    }
    if (!address.line1 || !address.city || !address.zip) {
      setError("Please fill in your full street address.");
      return;
    }

    setError(null);
    goToStep("review");
  }, [checkout, goToStep]);

  const placeOrder = useCallback(async () => {
    if (!cart) return;
    setProcessing(true);
    setError(null);

    const { customerInfo, orderNotes } = checkout;
    const { address } = customerInfo;

    try {
      const res = await client.post("/api/cod-checkout", {
        order_uuid: cart.uuid,
        email: customerInfo.email,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone || "",
        address_line1: address.line1,
        address_line2: address.line2 || "",
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        notes: orderNotes || "",
      });

      setCompletedOrder({
        orderId: res.data?.order_id,
        total: cart.attributes?.total_price?.formatted,
        paymentMethod: "Cash on Delivery",
      });

      dispatch({ type: "CLEAR_CART" });
      goToStep("complete");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [cart, checkout, dispatch, goToStep]);

  return {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    updateOrderNotes,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  };
}
