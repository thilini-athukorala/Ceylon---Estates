const API_URL = "http://localhost:5000/api/properties";

// Get all properties
export async function getProperties() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch properties");
    }

    return response.json();
}

// Get one property
export async function getPropertyById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch property");
    }

    return response.json();
}

// Create a new property
export async function createProperty(property) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(property),
    });

    if (!response.ok) {
        throw new Error("Failed to create property");
    }

    return response.json();
}

export async function updateProperty(id, property) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(property),
    });

    if (!response.ok) {
        throw new Error("Failed to update property");
    }

    return response.json();
}

export async function deleteProperty(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete property");
    }

    return response.json();
}