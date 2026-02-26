<?php

namespace Drupal\budhound_image_fetch\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\budhound_image_fetch\Service\GoogleImageSearch;

class ImageSearchController extends ControllerBase {

  protected $imageSearch;

  public function __construct(GoogleImageSearch $image_search) {
    $this->imageSearch = $image_search;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('budhound_image_fetch.google_image_search')
    );
  }

  /**
   * Search for product images.
   *
   * GET /api/budhound/image-search?q=lemon+og+flower+cannabis
   */
  public function search(Request $request): JsonResponse {
    $query = $request->query->get('q');

    if (empty($query)) {
      return new JsonResponse(['error' => 'Missing query parameter'], 400);
    }

    $max = (int) $this->config('budhound_image_fetch.settings')->get('max_results') ?: 6;
    $results = $this->imageSearch->search($query, $max);

    $images = array_map(function ($item) {
      return [
        'title' => $item['title'] ?? '',
        'url' => $item['link'] ?? '',
        'thumbnail' => $item['image']['thumbnailLink'] ?? '',
        'width' => $item['image']['width'] ?? 0,
        'height' => $item['image']['height'] ?? 0,
        'source' => $item['image']['contextLink'] ?? '',
      ];
    }, $results);

    return new JsonResponse(['images' => $images]);
  }

  /**
   * Download and attach an image to a product.
   *
   * POST /api/budhound/image-download
   * Body: { "url": "https://...", "product_id": 123, "filename": "lemon-og-flower" }
   */
  public function download(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE);

    if (empty($data['url']) || empty($data['product_id'])) {
      return new JsonResponse(['error' => 'Missing required fields (url, product_id)'], 400);
    }

    $filename = $data['filename'] ?? 'product-image';
    $file = $this->imageSearch->downloadAndCreateFile($data['url'], $filename);

    if (!$file) {
      return new JsonResponse(['error' => 'Failed to download image'], 500);
    }

    // Attach to product's field_product_image.
    $product = $this->entityTypeManager()
      ->getStorage('commerce_product')
      ->load($data['product_id']);

    if (!$product) {
      return new JsonResponse(['error' => 'Product not found'], 404);
    }

    if ($product->hasField('field_product_image')) {
      $product->set('field_product_image', [
        'target_id' => $file->id(),
        'alt' => $filename,
      ]);
      $product->save();
    }

    return new JsonResponse([
      'success' => TRUE,
      'file_id' => $file->id(),
      'uri' => $file->getFileUri(),
    ]);
  }

}
