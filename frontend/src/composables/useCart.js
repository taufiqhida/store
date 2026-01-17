import { ref, computed, watch } from 'vue'

// Cart items stored in localStorage
const CART_KEY = 'taufiq_cart'

// Load cart from localStorage
const loadCart = () => {
    try {
        const saved = localStorage.getItem(CART_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

// Cart state
const cartItems = ref(loadCart())

// Save cart to localStorage whenever it changes
watch(cartItems, (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
}, { deep: true })

// Cart visibility
const isCartOpen = ref(false)

// Computed properties
const cartCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const cartSubtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// Cart actions
const addToCart = (product, variant, quantity = 1) => {
    const existingIndex = cartItems.value.findIndex(
        item => item.productId === product.id && item.variantId === variant.id
    )

    if (existingIndex > -1) {
        // Update quantity if item already exists
        cartItems.value[existingIndex].quantity += quantity
    } else {
        // Add new item
        cartItems.value.push({
            id: Date.now(), // Unique cart item ID
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            categoryName: product.category?.name || '',
            variantId: variant.id,
            variantName: variant.name,
            price: variant.price,
            originalPrice: variant.originalPrice,
            quantity: quantity
        })
    }
}

const updateQuantity = (cartItemId, newQuantity) => {
    const index = cartItems.value.findIndex(item => item.id === cartItemId)
    if (index > -1) {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId)
        } else {
            cartItems.value[index].quantity = newQuantity
        }
    }
}

const removeFromCart = (cartItemId) => {
    const index = cartItems.value.findIndex(item => item.id === cartItemId)
    if (index > -1) {
        cartItems.value.splice(index, 1)
    }
}

const clearCart = () => {
    cartItems.value = []
}

const openCart = () => {
    isCartOpen.value = true
}

const closeCart = () => {
    isCartOpen.value = false
}

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
}

// Export composable
export const useCart = () => ({
    cartItems,
    cartCount,
    cartSubtotal,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    toggleCart
})

export default useCart
