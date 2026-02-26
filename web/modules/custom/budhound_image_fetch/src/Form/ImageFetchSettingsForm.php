<?php

namespace Drupal\budhound_image_fetch\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ImageFetchSettingsForm extends ConfigFormBase {

  protected function getEditableConfigNames() {
    return ['budhound_image_fetch.settings'];
  }

  public function getFormId() {
    return 'budhound_image_fetch_settings';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('budhound_image_fetch.settings');

    $form['google_api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google API Key'),
      '#default_value' => $config->get('google_api_key'),
      '#required' => TRUE,
      '#description' => $this->t('API key from Google Cloud Console with Custom Search API enabled.'),
    ];

    $form['google_cse_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google Custom Search Engine ID'),
      '#default_value' => $config->get('google_cse_id'),
      '#required' => TRUE,
      '#description' => $this->t('The Search Engine ID (cx) from Programmable Search Engine.'),
    ];

    $form['auto_attach'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Auto-attach first image result (no UI confirmation)'),
      '#description' => $this->t('When enabled, the first search result will be automatically attached to products without images on save. Recommended only for bulk imports.'),
      '#default_value' => $config->get('auto_attach'),
    ];

    $form['max_results'] = [
      '#type' => 'number',
      '#title' => $this->t('Max image results'),
      '#description' => $this->t('Number of image results to return for the picker UI (1-10).'),
      '#default_value' => $config->get('max_results') ?: 6,
      '#min' => 1,
      '#max' => 10,
    ];

    $form['safe_search'] = [
      '#type' => 'select',
      '#title' => $this->t('SafeSearch'),
      '#options' => [
        'active' => $this->t('Active (recommended)'),
        'off' => $this->t('Off'),
      ],
      '#default_value' => $config->get('safe_search') ?: 'active',
    ];

    $form['default_image_size'] = [
      '#type' => 'select',
      '#title' => $this->t('Default image size'),
      '#options' => [
        'large' => $this->t('Large'),
        'medium' => $this->t('Medium'),
        'xlarge' => $this->t('Extra Large'),
      ],
      '#default_value' => $config->get('default_image_size') ?: 'large',
    ];

    $form['fallback_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use fallback placeholder image when no results found'),
      '#default_value' => $config->get('fallback_enabled'),
    ];

    $form['fallback_image_uuid'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Fallback image file UUID'),
      '#description' => $this->t('UUID of the default placeholder file entity to use when no search results are found.'),
      '#default_value' => $config->get('fallback_image_uuid'),
      '#states' => [
        'visible' => [
          ':input[name="fallback_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('budhound_image_fetch.settings')
      ->set('google_api_key', $form_state->getValue('google_api_key'))
      ->set('google_cse_id', $form_state->getValue('google_cse_id'))
      ->set('auto_attach', (bool) $form_state->getValue('auto_attach'))
      ->set('max_results', (int) $form_state->getValue('max_results'))
      ->set('safe_search', $form_state->getValue('safe_search'))
      ->set('default_image_size', $form_state->getValue('default_image_size'))
      ->set('fallback_enabled', (bool) $form_state->getValue('fallback_enabled'))
      ->set('fallback_image_uuid', $form_state->getValue('fallback_image_uuid'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
