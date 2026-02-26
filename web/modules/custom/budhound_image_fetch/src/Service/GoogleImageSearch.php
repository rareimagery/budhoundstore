<?php

namespace Drupal\budhound_image_fetch\Service;

use GuzzleHttp\ClientInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;

class GoogleImageSearch {

  const API_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';

  protected $httpClient;
  protected $config;
  protected $fileSystem;

  public function __construct(
    ClientInterface $http_client,
    ConfigFactoryInterface $config_factory,
    FileSystemInterface $file_system
  ) {
    $this->httpClient = $http_client;
    $this->config = $config_factory->get('budhound_image_fetch.settings');
    $this->fileSystem = $file_system;
  }

  /**
   * Search for product images via Google CSE.
   *
   * @param string $query
   *   The search query string.
   * @param int $num
   *   Number of results to return (max 10).
   *
   * @return array
   *   Array of image result objects.
   */
  public function search(string $query, int $num = 6): array {
    $api_key = $this->config->get('google_api_key');
    $cse_id = $this->config->get('google_cse_id');

    if (empty($api_key) || empty($cse_id)) {
      \Drupal::logger('budhound_image_fetch')
        ->warning('Google API key or CSE ID not configured.');
      return [];
    }

    try {
      $response = $this->httpClient->request('GET', self::API_ENDPOINT, [
        'query' => [
          'q' => $query,
          'searchType' => 'image',
          'key' => $api_key,
          'cx' => $cse_id,
          'num' => min($num, 10),
          'safe' => $this->config->get('safe_search') ?: 'active',
          'imgSize' => $this->config->get('default_image_size') ?: 'large',
        ],
      ]);

      $data = json_decode($response->getBody(), TRUE);
      return $data['items'] ?? [];
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_image_fetch')
        ->error('Google CSE search failed: @message', [
          '@message' => $e->getMessage(),
        ]);
      return [];
    }
  }

  /**
   * Download an image from URL and create a Drupal File entity.
   *
   * @param string $url
   *   The image URL to download.
   * @param string $filename
   *   Desired filename for the saved image.
   *
   * @return \Drupal\file\Entity\File|null
   *   The created File entity, or NULL on failure.
   */
  public function downloadAndCreateFile(string $url, string $filename): ?File {
    try {
      $response = $this->httpClient->request('GET', $url, [
        'timeout' => 15,
        'headers' => [
          'User-Agent' => 'BudHound/1.0',
        ],
      ]);

      $content_type = $response->getHeader('Content-Type')[0] ?? '';
      $extension = $this->getExtensionFromMime($content_type);

      if (!$extension) {
        // Try to get extension from URL as fallback.
        $path = parse_url($url, PHP_URL_PATH);
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
          $extension = $ext;
        }
        else {
          \Drupal::logger('budhound_image_fetch')
            ->warning('Unknown image type @mime for @url', [
              '@mime' => $content_type,
              '@url' => $url,
            ]);
          return NULL;
        }
      }

      $directory = 'public://product-images/' . date('Y-m');
      $this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY);

      $sanitized = preg_replace('/[^a-z0-9\-]/', '-', strtolower($filename));
      $sanitized = preg_replace('/-+/', '-', trim($sanitized, '-'));
      $filepath = $directory . '/' . $sanitized . '.' . $extension;

      $file_data = (string) $response->getBody();

      if (strlen($file_data) < 1000) {
        \Drupal::logger('budhound_image_fetch')
          ->warning('Downloaded file too small (@size bytes), skipping: @url', [
            '@size' => strlen($file_data),
            '@url' => $url,
          ]);
        return NULL;
      }

      $file_uri = \Drupal::service('file.repository')->writeData(
        $file_data,
        $filepath,
        FileSystemInterface::EXISTS_RENAME
      );

      if ($file_uri) {
        $file_uri->setPermanent();
        $file_uri->save();
        return $file_uri;
      }

      return NULL;
    }
    catch (\Exception $e) {
      \Drupal::logger('budhound_image_fetch')
        ->error('Failed to download image from @url: @message', [
          '@url' => $url,
          '@message' => $e->getMessage(),
        ]);
      return NULL;
    }
  }

  /**
   * Map MIME type to file extension.
   */
  protected function getExtensionFromMime(string $mime): ?string {
    $map = [
      'image/jpeg' => 'jpg',
      'image/png' => 'png',
      'image/webp' => 'webp',
      'image/gif' => 'gif',
    ];
    return $map[$mime] ?? NULL;
  }

}
