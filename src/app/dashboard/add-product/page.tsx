// This component is now effectively an alias for the new edit page.
// The new edit page will handle both creating and updating a product.
// We keep this file to avoid breaking existing links to "/dashboard/add-product".
import EditProductPage from "../edit-product/[id]/page";

export default function AddProductPage() {
    // Render the edit page with a "new" ID to signify creation.
    return <EditProductPage params={{ id: 'new' }} />;
}
