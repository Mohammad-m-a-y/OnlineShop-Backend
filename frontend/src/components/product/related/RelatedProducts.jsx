"use client";

import { useEffect, useState } from "react";
import { getRelatedProducts } from "@/services/product.service";
import ProductCarousel from "./ProductCarousel";

export default function RelatedProducts({productId}) {  

    const [products,setProducts]=useState([]);

    const [loading,setLoading]=useState(true);

    useEffect(()=>{

        async function fetchProducts(){

            try{
                const data=  await getRelatedProducts(productId);
                setProducts(data.items);

            }finally{
                setLoading(false);
            }

        }

        fetchProducts();

    },[productId]);

    if(loading){

        return null;

    }

    return(

        <ProductCarousel
            title="محصولات مشابه"
            products={products}
        />

    );

}