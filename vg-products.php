<?php
/**
 * VisionGarage - WooCommerce Product Helper
 * Upload to your WordPress root, access via browser, delete when done.
 * URL: https://visiongarage.ro/vg-products.php?key=VG2026
 */

if (!isset($_GET['key']) || $_GET['key'] !== 'VG2026') {
    http_response_code(403);
    die('Access denied');
}

require_once __DIR__ . '/wp-load.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$args = array(
    'post_type'      => 'product',
    'posts_per_page' => -1,
    'post_status'    => 'any',
);

$products = get_posts($args);
$output = array();

foreach ($products as $post) {
    $product = wc_get_product($post->ID);
    if (!$product) continue;

    $images = array();
    $image_id = $product->get_image_id();
    if ($image_id) {
        $images[] = wp_get_attachment_url($image_id);
    }
    foreach ($product->get_gallery_image_ids() as $gid) {
        $images[] = wp_get_attachment_url($gid);
    }

    $cats = array();
    foreach ($product->get_category_ids() as $cid) {
        $term = get_term($cid);
        if ($term) $cats[] = $term->name;
    }

    $output[] = array(
        'id'                => $product->get_id(),
        'name'              => $product->get_name(),
        'slug'              => $product->get_slug(),
        'status'            => $product->get_status(),
        'type'              => $product->get_type(),
        'price'             => $product->get_price(),
        'regular_price'     => $product->get_regular_price(),
        'sale_price'        => $product->get_sale_price(),
        'sku'               => $product->get_sku(),
        'stock_status'      => $product->get_stock_status(),
        'short_description' => $product->get_short_description(),
        'description'       => $product->get_description(),
        'permalink'         => $product->get_permalink(),
        'categories'        => $cats,
        'images'            => $images,
    );
}

echo json_encode(array(
    'total'    => count($output),
    'products' => $output,
), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
