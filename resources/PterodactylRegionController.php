<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\PterodactylRegionSettingsFormRequest;
use GuzzleHttp\Client;
use Illuminate\Support\Arr;

class PterodactylRegionController extends Controller
{
    /**
     * PterodactylRegionController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
        private Kernel $kernel,
        private ViewFactory $view,
        private Client $client
    ) {
    }

    /**
     * Render advanced Panel settings UI.
     */
    public function index(): View
    {
        $json_data = [];
        
        $response = $this->client->request('GET', 'https://exeyarikus.info/pterodactyl-region/info.json');
        if ($response->getStatusCode() === 200) {
            $json_data = json_decode($response->getBody(), true);
        }
        
        return $this->view->make('admin.settings.pterodactyl-region', [
            'version' => Arr::get($json_data, 'version') ?? '2.0',
            'my_version' => '2.0',
            'discord' => Arr::get($json_data, 'discord') ?? 'https://dsc.gg/mrlg',
        ]);
    }

    /**
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(PterodactylRegionSettingsFormRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->kernel->call('queue:restart');
        $this->alert->success('Pterodactyl Region settings have been successfully updated.')->flash();

        return redirect()->route('admin.settings.pterodactyl-region');
    }
}
