"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/user.service";

import UserTable from "@/components/admin/users/UserTable";

export default function AdminUsersPage() {

    const [users, setUsers] = useState([]);

    const [page, setPage] = useState(1);

    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);

    async function loadUsers(currentPage = page) {

        try {

            setLoading(true);

            const data = await getUsers({
                page: currentPage,
                page_size: pageSize,
            });

            setUsers(data.items);

            setTotalPages(data.total_pages);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadUsers(page);

    }, [page]);



    return (

        <UserTable
            users={users}
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={setPage}
            onRefresh={() => loadUsers(page)}
        />

    );

}