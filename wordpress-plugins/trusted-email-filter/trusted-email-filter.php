<?php
/**
 * Plugin Name: Trusted Email Filter
 * Plugin URI: https://meindesk.gr
 * Description: Restricts user registration to trusted email providers only. Allows major providers (Gmail, Outlook, Yahoo, etc.) and custom domains.
 * Version: 1.0.0
 * Author: Meindesk
 * Author URI: https://meindesk.gr
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: trusted-email-filter
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Trusted_Email_Filter {
    
    /**
     * Trusted email domains - major providers
     */
    private $trusted_providers = array(
        // Google
        'gmail.com',
        'googlemail.com',
        
        // Microsoft
        'outlook.com',
        'hotmail.com',
        'live.com',
        'msn.com',
        'outlook.gr',
        'hotmail.gr',
        
        // Yahoo
        'yahoo.com',
        'yahoo.gr',
        'ymail.com',
        
        // Apple
        'icloud.com',
        'me.com',
        'mac.com',
        
        // Other major providers
        'protonmail.com',
        'proton.me',
        'zoho.com',
        'aol.com',
        'mail.com',
        'gmx.com',
        'gmx.net',
        
        // Greek providers
        'otenet.gr',
        'forthnet.gr',
        'vodafone.gr',
        'cosmote.gr',
        'wind.gr',
        'hol.gr',
    );
    
    /**
     * Custom allowed domains (business domains)
     */
    private $custom_domains = array(
        'xarisconceptstore.gr',
        'meindesk.gr',
    );
    
    /**
     * Constructor
     */
    public function __construct() {
        // Filter registration emails
        add_filter('registration_errors', array($this, 'validate_registration_email'), 10, 3);
        
        // Filter new user creation (admin panel)
        add_filter('user_profile_update_errors', array($this, 'validate_user_email'), 10, 3);
        
        // Filter pre-user email update
        add_filter('pre_user_email', array($this, 'validate_email_update'), 10, 1);
        
        // WooCommerce registration
        add_filter('woocommerce_registration_errors', array($this, 'validate_woocommerce_registration'), 10, 3);
        
        // Add admin menu for settings
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
        
        // Load saved settings
        $this->load_settings();
    }
    
    /**
     * Load settings from database
     */
    private function load_settings() {
        $saved_custom = get_option('tef_custom_domains', '');
        if (!empty($saved_custom)) {
            $additional_domains = array_map('trim', explode("\n", $saved_custom));
            $additional_domains = array_filter($additional_domains);
            $this->custom_domains = array_merge($this->custom_domains, $additional_domains);
        }
        
        $saved_providers = get_option('tef_trusted_providers', '');
        if (!empty($saved_providers)) {
            $additional_providers = array_map('trim', explode("\n", $saved_providers));
            $additional_providers = array_filter($additional_providers);
            $this->trusted_providers = array_merge($this->trusted_providers, $additional_providers);
        }
    }
    
    /**
     * Get all allowed domains
     */
    private function get_allowed_domains() {
        return array_merge($this->trusted_providers, $this->custom_domains);
    }
    
    /**
     * Check if email domain is trusted
     */
    private function is_trusted_email($email) {
        $email = strtolower(trim($email));
        $domain = substr(strrchr($email, '@'), 1);
        
        if (empty($domain)) {
            return false;
        }
        
        $allowed_domains = $this->get_allowed_domains();
        
        return in_array($domain, $allowed_domains);
    }
    
    /**
     * Validate registration email
     */
    public function validate_registration_email($errors, $sanitized_user_login, $user_email) {
        if (!$this->is_trusted_email($user_email)) {
            $errors->add('invalid_email_provider', 
                __('<strong>Error</strong>: Registration is restricted to trusted email providers only. Please use a valid email from Gmail, Outlook, Yahoo, or another major provider.', 'trusted-email-filter')
            );
        }
        
        return $errors;
    }
    
    /**
     * Validate user email on profile update
     */
    public function validate_user_email($errors, $update, $user) {
        if (isset($user->user_email) && !$this->is_trusted_email($user->user_email)) {
            // Allow admins to bypass
            if (!current_user_can('manage_options')) {
                $errors->add('invalid_email_provider',
                    __('Email provider not allowed. Please use a trusted email provider.', 'trusted-email-filter')
                );
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate email on update
     */
    public function validate_email_update($email) {
        // Allow admins to bypass
        if (current_user_can('manage_options')) {
            return $email;
        }
        
        if (!$this->is_trusted_email($email)) {
            // Return original email to prevent update
            $current_user = wp_get_current_user();
            if ($current_user->ID) {
                return $current_user->user_email;
            }
        }
        
        return $email;
    }
    
    /**
     * Validate WooCommerce registration
     */
    public function validate_woocommerce_registration($errors, $username, $email) {
        if (!$this->is_trusted_email($email)) {
            $errors->add('invalid_email_provider',
                __('Registration is restricted to trusted email providers only. Please use a valid email from Gmail, Outlook, Yahoo, or another major provider.', 'trusted-email-filter')
            );
        }
        
        return $errors;
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Trusted Email Filter', 'trusted-email-filter'),
            __('Email Filter', 'trusted-email-filter'),
            'manage_options',
            'trusted-email-filter',
            array($this, 'settings_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('tef_settings', 'tef_custom_domains', array(
            'sanitize_callback' => 'sanitize_textarea_field'
        ));
        
        register_setting('tef_settings', 'tef_trusted_providers', array(
            'sanitize_callback' => 'sanitize_textarea_field'
        ));
    }
    
    /**
     * Settings page HTML
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Trusted Email Filter Settings', 'trusted-email-filter'); ?></h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('tef_settings'); ?>
                
                <h2><?php _e('Default Trusted Providers', 'trusted-email-filter'); ?></h2>
                <p class="description">
                    <?php _e('The following email providers are allowed by default:', 'trusted-email-filter'); ?>
                </p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <strong>Major Providers:</strong> gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com, protonmail.com, etc.<br>
                    <strong>Greek Providers:</strong> otenet.gr, forthnet.gr, vodafone.gr, cosmote.gr, wind.gr, hol.gr<br>
                    <strong>Business Domains:</strong> xarisconceptstore.gr, meindesk.gr
                </div>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="tef_custom_domains"><?php _e('Additional Custom Domains', 'trusted-email-filter'); ?></label>
                        </th>
                        <td>
                            <textarea 
                                name="tef_custom_domains" 
                                id="tef_custom_domains" 
                                rows="5" 
                                cols="50" 
                                class="large-text"
                                placeholder="example.com&#10;anotherdomain.gr"
                            ><?php echo esc_textarea(get_option('tef_custom_domains', '')); ?></textarea>
                            <p class="description">
                                <?php _e('Enter additional business/organization domains (one per line). Do not include @ symbol.', 'trusted-email-filter'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="tef_trusted_providers"><?php _e('Additional Trusted Providers', 'trusted-email-filter'); ?></label>
                        </th>
                        <td>
                            <textarea 
                                name="tef_trusted_providers" 
                                id="tef_trusted_providers" 
                                rows="5" 
                                cols="50" 
                                class="large-text"
                                placeholder="provider.com&#10;anotherprovider.net"
                            ><?php echo esc_textarea(get_option('tef_trusted_providers', '')); ?></textarea>
                            <p class="description">
                                <?php _e('Enter additional email providers to allow (one per line). Do not include @ symbol.', 'trusted-email-filter'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2><?php _e('Test Email', 'trusted-email-filter'); ?></h2>
            <p><?php _e('Test if an email address would be allowed:', 'trusted-email-filter'); ?></p>
            
            <input type="email" id="test-email" placeholder="test@example.com" style="width: 300px;">
            <button type="button" class="button" onclick="testEmail()"><?php _e('Test', 'trusted-email-filter'); ?></button>
            <span id="test-result" style="margin-left: 10px;"></span>
            
            <script>
                function testEmail() {
                    var email = document.getElementById('test-email').value;
                    var domain = email.split('@')[1];
                    var allowedDomains = <?php echo json_encode($this->get_allowed_domains()); ?>;
                    var result = document.getElementById('test-result');
                    
                    if (domain && allowedDomains.includes(domain.toLowerCase())) {
                        result.innerHTML = '<span style="color: green; font-weight: bold;">✓ Allowed</span>';
                    } else {
                        result.innerHTML = '<span style="color: red; font-weight: bold;">✗ Not Allowed</span>';
                    }
                }
            </script>
        </div>
        <?php
    }
}

// Initialize the plugin
new Trusted_Email_Filter();
