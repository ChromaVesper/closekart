import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Star, Phone, Truck, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ShopDetails = () => {
    const { id } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopAndProducts = async () => {
            try {
                // Fetch shop details
                const shopSnap = await getDoc(doc(db, 'shops', id));
                if (shopSnap.exists()) {
                    setShop({ id: shopSnap.id, ...shopSnap.data() });
                }

                // Fetch shop products natively
                const q = query(collection(db, 'products'), where('shopId', '==', id), where('inStock', '==', true));
                const prodSnap = await getDocs(q);
                setProducts(prodSnap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching shop details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopAndProducts();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading Shop Details...</div>;
    if (!shop) return <div className="p-8 text-center">Shop not found</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Shop Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.shopName}</h1>
                        <p className="text-gray-500 font-medium mb-4">{shop.category}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center"><MapPin size={16} className="mr-1" /> {shop.address}</span>
                            <span className="flex items-center text-blue-600 font-medium"><Star size={16} className="mr-1 fill-current" /> {shop.rating} ({shop.reviewCount} reviews)</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${shop.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shop.isOpen ? 'Open Now' : 'Currently Closed'}
                        </span>
                        {shop.deliveryAvailable && <span className="text-xs text-gray-500">Delivery Charge: ₹{shop.deliveryCharge || 0}</span>}
                        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                            <Phone size={18} className="mr-2" /> {shop.phone || 'Contact'}
                        </button>
                    </div>
                </div>
                <hr className="my-6 border-gray-100" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-3 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-900">Opening Hours</p>
                            <p>{shop.openingHours}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Truck size={18} className="mr-3 text-gray-400" />
                        <div>
                            <p className="font-semibold text-gray-900">Delivery Range</p>
                            <p>Within 3 km</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Products */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Products Available</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <Store size={48} className="mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-600">No Products Listed</h3>
                        <p className="text-sm font-medium">This active store hasn't published any items yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetails;
