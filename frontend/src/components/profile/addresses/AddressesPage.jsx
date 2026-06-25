"use client";

import { useEffect, useState } from "react";
import { getMyAddresses, deleteAddress,} from "@/services/address.service";
import AddressFormModal from "./AddressFormModal";







export default function AddressesPage() {

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);



    async function loadAddresses() {

        try {

            setLoading(true);

            const data = await getMyAddresses();

            setAddresses(data.items);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {

        loadAddresses();

    }, []);

    async function handleDelete(id) {

        const confirmed = window.confirm( "آیا از حذف این آدرس مطمئن هستید؟" );

        if (!confirmed) return;

        await deleteAddress(id);

        await loadAddresses();
    }

    function handleCreate() {

        setEditingAddress(null);

        setShowModal(true);
    }

    function handleEdit(address) {

        setEditingAddress(address);

        setShowModal(true);
    }

    return (
        <div>

            <div>

                <h1>
                    آدرس‌های من
                </h1>

                <button onClick={handleCreate} >
                    افزودن آدرس
                </button>

            </div>

            {loading && (
                <p>
                    در حال بارگذاری...
                </p>
            )}

            {(!loading && addresses.length === 0 )&& (
                    <p>
                        هنوز آدرسی ثبت نشده است.
                    </p>
                )}

            {addresses.map((address) => (

                <div key={address.id}>

                    <h3>
                        {address.receiver_name}
                    </h3>

                    <p>
                        {address.receiver_mobile}
                    </p>

                    <p>
                        {address.province}
                        {" - "}
                        {address.city}
                    </p>

                    <p>
                        {address.full_address}
                    </p>

                    <p>
                        کد پستی:
                        {" "}
                        {address.postal_code}
                    </p>

                    <button onClick={() => handleEdit(address) }
                    >
                        ویرایش
                    </button>

                    <button
                        onClick={() => handleDelete(address.id) }
                    >
                        حذف
                    </button>

                </div>
            ))}

            {showModal && (
                <AddressFormModal
                    address={editingAddress}
                    onClose={() =>
                        setShowModal(false)
                    }
                    onSuccess={() => {
                        setShowModal(false);
                        loadAddresses();
                    }}
                />
            )}

        </div>
    );
}