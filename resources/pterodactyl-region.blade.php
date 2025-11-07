@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterodactyl-region'])

@section('title')
    Pterodactyl Region Settings
@endsection

@section('content-header')
    <h1>Pterodactyl Region Settings<small>Configure settings for addon "Pterodactyl Region".</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.settings.pterodactyl-region') }}" method="POST">
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">API Settings</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">API IP Connect</label>
                                <div>
                                    @php
                                        $ip_api = old('region-api:ip', config('region-api.ip'));
                                    @endphp
                                    <select class="form-control" name="region-api:ip">
                                        <option value="ipapi.is" @if($ip_api === 'ipapi.is') selected @endif>ipapi.is</option>
                                        <option value="ipwho.is" @if($ip_api === 'ipwho.is') selected @endif>ipwho.is</option>
                                        <option value="ipapi.co" @if($ip_api === 'ipapi.co') selected @endif>ipapi.co</option>
                                        <option value="geoiplookup.io" @if($ip_api === 'geoiplookup.io') selected @endif>geoiplookup.io</option>
                                    </select>
                                    <p class="text-muted small">Select, what IP API use for this addon</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">DNS IP Connect</label>
                                <div>
                                    @php
                                        $dns_api = old('region-api:dns', config('region-api.dns'));
                                    @endphp
                                    <select class="form-control" name="region-api:dns">
                                        <option value="DNS-Google" @if($dns_api === 'DNS-Google') selected @endif>DNS Google</option>
                                        <option value="DNS-Cloudflare" @if($dns_api === 'DNS-Cloudflare') selected @endif>DNS Cloudflare</option>
                                    </select>
                                    <p class="text-muted small">Select, what API DNS use for this addon</p>
                                </div>
                            </div>
                        </div>
                        @if($my_version === $version)
                            <div class="box-body">
                                You are running Pterodactyl Region version <code>{{ $version }}</code>. Your addon is up-to-date
                            </div>
                        @else
                            <div class="row">
                                <div class="col-xs-12">
                                    <div class="alert alert-error no-margin">
                                        Your addon is <strong>not up-to-date.</strong> The latest version of Pterodactyl Region is <code>{{ $version }}</code> and you are currently running version <code>{{ $my_version }}</code>.
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>
                    <div class="box-footer">
                        {{ csrf_field() }}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
                        <a href={{ $discord }} class="btn btn-sm btn-primary pull-left"><i class="fa fa-fw fa-link"></i> Discord Help</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection
