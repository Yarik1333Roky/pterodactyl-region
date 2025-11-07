<?php

namespace Pterodactyl\Http\Requests\Admin\Settings;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class PterodactylRegionSettingsFormRequest extends AdminFormRequest
{
    /**
     * Return all the rules to apply to this request's data.
     */
    public function rules(): array
    {
        return [
            'region-api:ip' => 'required|string|max:30',
            'region-api:dns' => 'required|string|max:30',
        ];
    }

    public function attributes(): array
    {
        return [
            'region-api:ip' => 'IP API Connect',
            'region-api:dns' => 'DNS API Connect',
        ];
    }
}
