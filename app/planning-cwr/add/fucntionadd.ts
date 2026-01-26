export const fetchListMRP = async () => {
  try {
    const response = await fetch('/api/list_mrp', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data MRP');
    }

    const result = await response.json();
    
    // Mengembalikan result.data sesuai struktur yang Anda minta
    return result.data || []; 
  } catch (error) {
    console.error("Error fetching MRP:", error);
    return [];
  }
};