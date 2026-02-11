# 파일 스토리지(File Storage)

- [소개](#introduction)
- [설정](#configuration)
    - [로컬 드라이버](#the-local-driver)
    - [퍼블릭 디스크](#the-public-disk)
    - [드라이버 사전 준비사항](#driver-prerequisites)
    - [스코프 및 읽기 전용 파일시스템](#scoped-and-read-only-filesystems)
    - [Amazon S3 호환 파일시스템](#amazon-s3-compatible-filesystems)
- [디스크 인스턴스 획득](#obtaining-disk-instances)
    - [온디맨드 디스크](#on-demand-disks)
- [파일 조회](#retrieving-files)
    - [파일 다운로드](#downloading-files)
    - [파일 URL](#file-urls)
    - [임시 URL](#temporary-urls)
    - [파일 메타데이터](#file-metadata)
- [파일 저장](#storing-files)
    - [파일 앞/뒤에 내용 추가](#prepending-appending-to-files)
    - [파일 복사 및 이동](#copying-moving-files)
    - [자동 스트리밍](#automatic-streaming)
    - [파일 업로드](#file-uploads)
    - [파일 가시성](#file-visibility)
- [파일 삭제](#deleting-files)
- [디렉토리](#directories)
- [테스트](#testing)
- [커스텀 파일시스템](#custom-filesystems)

<a name="introduction"></a>
## 소개

Laravel은 Frank de Jonge가 만든 훌륭한 [Flysystem](https://github.com/thephpleague/flysystem) PHP 패키지 덕분에 강력한 파일시스템 추상화를 제공합니다. Laravel Flysystem 통합은 로컬 파일시스템, SFTP, Amazon S3와 작업하기 위한 간단한 드라이버를 제공합니다. 더 좋은 점은 각 시스템에서 API가 동일하게 유지되므로 로컬 개발 머신과 프로덕션 서버 간에 이러한 스토리지 옵션을 놀라울 정도로 쉽게 전환할 수 있다는 것입니다.

<a name="configuration"></a>
## 설정

Laravel의 파일시스템 설정 파일은 `config/filesystems.php`에 위치합니다. 이 파일에서 모든 파일시스템 "디스크"를 설정할 수 있습니다. 각 디스크는 특정 스토리지 드라이버와 스토리지 위치를 나타냅니다. 지원되는 각 드라이버에 대한 예제 설정이 설정 파일에 포함되어 있으므로 스토리지 기본 설정과 자격 증명을 반영하도록 설정을 수정할 수 있습니다.

`local` 드라이버는 Laravel 애플리케이션이 실행되는 서버에 로컬로 저장된 파일과 상호 작용하며, `s3` 드라이버는 Amazon의 S3 클라우드 스토리지 서비스에 쓰기 위해 사용됩니다.

> [!NOTE]  
> 원하는 만큼 많은 디스크를 설정할 수 있으며 동일한 드라이버를 사용하는 여러 디스크를 가질 수도 있습니다.

<a name="the-local-driver"></a>
### 로컬 드라이버

`local` 드라이버를 사용할 때 모든 파일 작업은 `filesystems` 설정 파일에 정의된 `root` 디렉토리를 기준으로 합니다. 기본적으로 이 값은 `storage/app/private` 디렉토리로 설정됩니다. 따라서 다음 메서드는 `storage/app/private/example.txt`에 쓰게 됩니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### 퍼블릭 디스크

애플리케이션의 `filesystems` 설정 파일에 포함된 `public` 디스크는 공개적으로 접근 가능한 파일을 위한 것입니다. 기본적으로 `public` 디스크는 `local` 드라이버를 사용하며 파일을 `storage/app/public`에 저장합니다.

`public` 디스크가 `local` 드라이버를 사용하고 이 파일들을 웹에서 접근 가능하게 하려면, 소스 디렉토리 `storage/app/public`에서 대상 디렉토리 `public/storage`로 심볼릭 링크를 생성해야 합니다.

심볼릭 링크를 생성하려면 `storage:link` Artisan 명령어를 사용할 수 있습니다.

```shell
php artisan storage:link
```

파일이 저장되고 심볼릭 링크가 생성되면, `asset` 헬퍼를 사용하여 파일에 대한 URL을 생성할 수 있습니다.

```php
echo asset('storage/file.txt');
```

`filesystems` 설정 파일에서 추가 심볼릭 링크를 설정할 수 있습니다. 설정된 각 링크는 `storage:link` 명령어를 실행할 때 생성됩니다.

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

`storage:unlink` 명령어를 사용하여 설정된 심볼릭 링크를 제거할 수 있습니다.

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### 드라이버 사전 준비사항

<a name="s3-driver-configuration"></a>
#### S3 드라이버 설정

S3 드라이버를 사용하기 전에 Composer 패키지 관리자를 통해 Flysystem S3 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

S3 디스크 설정 배열은 `config/filesystems.php` 설정 파일에 있습니다. 일반적으로 `config/filesystems.php` 설정 파일에서 참조하는 다음 환경 변수를 사용하여 S3 정보와 자격 증명을 설정해야 합니다.

```ini
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

편의를 위해 이러한 환경 변수는 AWS CLI에서 사용하는 명명 규칙과 일치합니다.

<a name="ftp-driver-configuration"></a>
#### FTP 드라이버 설정

FTP 드라이버를 사용하기 전에 Composer 패키지 관리자를 통해 Flysystem FTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-ftp "^3.0"
```

Laravel의 Flysystem 통합은 FTP와 훌륭하게 작동합니다. 그러나 프레임워크의 기본 `config/filesystems.php` 설정 파일에는 샘플 설정이 포함되어 있지 않습니다. FTP 파일시스템을 설정해야 하는 경우 아래의 설정 예제를 사용할 수 있습니다.

```php
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // 선택적 FTP 설정...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a name="sftp-driver-configuration"></a>
#### SFTP 드라이버 설정

SFTP 드라이버를 사용하기 전에 Composer 패키지 관리자를 통해 Flysystem SFTP 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Laravel의 Flysystem 통합은 SFTP와 훌륭하게 작동합니다. 그러나 프레임워크의 기본 `config/filesystems.php` 설정 파일에는 샘플 설정이 포함되어 있지 않습니다. SFTP 파일시스템을 설정해야 하는 경우 아래의 설정 예제를 사용할 수 있습니다.

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // 기본 인증 설정...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // 암호화 비밀번호가 있는 SSH 키-기반 인증 설정...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // 파일 / 디렉토리 권한 설정...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // 선택적 SFTP 설정...
    // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
    // 'maxTries' => 4,
    // 'passphrase' => env('SFTP_PASSPHRASE'),
    // 'port' => env('SFTP_PORT', 22),
    // 'root' => env('SFTP_ROOT', ''),
    // 'timeout' => 30,
    // 'useAgent' => true,
],
```

<a name="scoped-and-read-only-filesystems"></a>
### 스코프 및 읽기 전용 파일시스템

스코프 디스크를 사용하면 모든 경로에 지정된 경로 접두사가 자동으로 붙는 파일시스템을 정의할 수 있습니다. 스코프 파일시스템 디스크를 생성하기 전에 Composer 패키지 관리자를 통해 추가 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

`scoped` 드라이버를 사용하는 디스크를 정의하여 기존 파일시스템 디스크의 경로 스코프 인스턴스를 생성할 수 있습니다. 예를 들어, 기존 `s3` 디스크를 특정 경로 접두사로 스코프하는 디스크를 생성할 수 있으며, 스코프된 디스크를 사용하는 모든 파일 작업은 지정된 접두사를 사용합니다.

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

"읽기 전용" 디스크를 사용하면 쓰기 작업을 허용하지 않는 파일시스템 디스크를 생성할 수 있습니다. `read-only` 설정 옵션을 사용하기 전에 Composer 패키지 관리자를 통해 추가 Flysystem 패키지를 설치해야 합니다.

```shell
composer require league/flysystem-read-only "^3.0"
```

다음으로, 하나 이상의 디스크 설정 배열에 `read-only` 설정 옵션을 포함할 수 있습니다.

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

<a name="amazon-s3-compatible-filesystems"></a>
### Amazon S3 호환 파일시스템

기본적으로 애플리케이션의 `filesystems` 설정 파일에는 `s3` 디스크에 대한 디스크 설정이 포함되어 있습니다. [Amazon S3](https://aws.amazon.com/s3/)와 상호 작용하는 데 이 디스크를 사용하는 것 외에도 [MinIO](https://github.com/minio/minio), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/), [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/)와 같은 S3 호환 파일 스토리지 서비스와 상호 작용하는 데 사용할 수 있습니다.

일반적으로 사용하려는 서비스의 자격 증명과 일치하도록 디스크의 자격 증명을 업데이트한 후에는 `endpoint` 설정 옵션 값만 업데이트하면 됩니다. 이 옵션의 값은 일반적으로 `AWS_ENDPOINT` 환경 변수를 통해 정의됩니다.

```php
'endpoint' => env('AWS_ENDPOINT'),
```

<a name="minio"></a>
#### MinIO

MinIO를 사용할 때 Laravel의 Flysystem 통합이 적절한 URL을 생성하려면 `AWS_URL` 환경 변수를 정의하여 애플리케이션의 로컬 URL과 일치하고 URL 경로에 버킷 이름을 포함하도록 해야 합니다.

```ini
AWS_URL=http://localhost:9000/local
```

> [!WARNING]  
> `endpoint`가 클라이언트에서 접근할 수 없는 경우 MinIO를 사용할 때 `temporaryUrl` 메서드를 통한 임시 저장소 URL 생성이 작동하지 않을 수 있습니다.

<a name="obtaining-disk-instances"></a>
## 디스크 인스턴스 획득

`Storage` 파사드를 사용하여 설정된 모든 디스크와 상호 작용할 수 있습니다. 예를 들어, 파사드의 `put` 메서드를 사용하여 기본 디스크에 아바타를 저장할 수 있습니다. 먼저 `disk` 메서드를 호출하지 않고 `Storage` 파사드에서 메서드를 호출하면, 메서드는 자동으로 기본 디스크로 전달됩니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

애플리케이션이 여러 디스크와 상호 작용하는 경우, `Storage` 파사드의 `disk` 메서드를 사용하여 특정 디스크의 파일 작업을 수행할 수 있습니다.

```php
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### 온디맨드 디스크

때로는 애플리케이션의 `filesystems` 설정 파일에 해당 설정이 실제로 없어도 주어진 설정을 사용하여 런타임에 디스크를 생성하고 싶을 수 있습니다. 이를 위해 `Storage` 파사드의 `build` 메서드에 설정 배열을 전달할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a name="retrieving-files"></a>
## 파일 조회

`get` 메서드는 파일의 내용을 조회하는 데 사용될 수 있습니다. 파일의 원시 문자열 내용이 메서드에 의해 반환됩니다. 모든 파일 경로는 디스크의 "root" 위치를 기준으로 지정해야 합니다.

```php
$contents = Storage::get('file.jpg');
```

조회하는 파일이 JSON을 포함하는 경우, `json` 메서드를 사용하여 파일을 조회하고 내용을 디코딩할 수 있습니다.

```php
$orders = Storage::json('orders.json');
```

`exists` 메서드는 디스크에 파일이 존재하는지 확인하는 데 사용될 수 있습니다.

```php
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

`missing` 메서드는 디스크에서 파일이 누락되었는지 확인하는 데 사용될 수 있습니다.

```php
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### 파일 다운로드

`download` 메서드는 사용자의 브라우저가 주어진 경로의 파일을 다운로드하도록 강제하는 응답을 생성하는 데 사용될 수 있습니다. `download` 메서드는 파일을 다운로드하는 사용자가 보게 될 파일명을 두 번째 인수로 받습니다. 마지막으로 HTTP 헤더 배열을 세 번째 인수로 메서드에 전달할 수 있습니다.

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### 파일 URL

`url` 메서드를 사용하여 주어진 파일의 URL을 가져올 수 있습니다. `local` 드라이버를 사용하는 경우, 이는 일반적으로 주어진 경로 앞에 `/storage`를 추가하고 파일에 대한 상대 URL을 반환합니다. `s3` 드라이버를 사용하는 경우, 완전한 원격 URL이 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

`local` 드라이버를 사용할 때 공개적으로 접근 가능해야 하는 모든 파일은 `storage/app/public` 디렉토리에 배치해야 합니다. 또한 `storage/app/public` 디렉토리를 가리키는 `public/storage`에 [심볼릭 링크를 생성](#the-public-disk)해야 합니다.

> [!WARNING]  
> `local` 드라이버를 사용할 때 `url`의 반환 값은 URL 인코딩되지 않습니다. 이러한 이유로 항상 유효한 URL을 생성할 이름을 사용하여 파일을 저장하는 것을 권장합니다.

<a name="url-host-customization"></a>
#### URL 호스트 커스터마이징

`Storage` 파사드를 사용하여 생성된 URL의 호스트를 수정하려면 디스크의 설정 배열에서 `url` 옵션을 추가하거나 변경할 수 있습니다.

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],
```

<a name="temporary-urls"></a>
### 임시 URL

`temporaryUrl` 메서드를 사용하여 `local` 및 `s3` 드라이버를 사용하여 저장된 파일에 대한 임시 URL을 생성할 수 있습니다. 이 메서드는 경로와 URL이 만료되어야 하는 시점을 지정하는 `DateTime` 인스턴스를 받습니다.

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

<a name="enabling-local-temporary-urls"></a>
#### 로컬 임시 URL 활성화

`local` 드라이버에 임시 URL 지원이 도입되기 전에 애플리케이션 개발을 시작한 경우 로컬 임시 URL을 활성화해야 할 수 있습니다. 이렇게 하려면 `config/filesystems.php` 설정 파일 내의 `local` 디스크 설정 배열에 `serve` 옵션을 추가하세요.

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'serve' => true, // [tl! add]
    'throw' => false,
],
```

<a name="s3-request-parameters"></a>
#### S3 요청 매개변수

추가 [S3 요청 매개변수](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests)를 지정해야 하는 경우, `temporaryUrl` 메서드의 세 번째 인수로 요청 매개변수 배열을 전달할 수 있습니다.

```php
$url = Storage::temporaryUrl(
    'file.jpg',
    now()->addMinutes(5),
    [
        'ResponseContentType' => 'application/octet-stream',
        'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
    ]
);
```

<a name="customizing-temporary-urls"></a>
#### 임시 URL 커스터마이징

특정 스토리지 디스크에 대해 임시 URL이 생성되는 방식을 커스터마이징해야 하는 경우 `buildTemporaryUrlsUsing` 메서드를 사용할 수 있습니다. 예를 들어, 일반적으로 임시 URL을 지원하지 않는 디스크를 통해 저장된 파일을 다운로드할 수 있게 하는 컨트롤러가 있는 경우 유용할 수 있습니다. 일반적으로 이 메서드는 서비스 프로바이더의 `boot` 메서드에서 호출해야 합니다.

```php
<?php

namespace App\Providers;

use DateTime;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Storage::disk('local')->buildTemporaryUrlsUsing(
            function (string $path, DateTime $expiration, array $options) {
                return URL::temporarySignedRoute(
                    'files.download',
                    $expiration,
                    array_merge($options, ['path' => $path])
                );
            }
        );
    }
}
```

<a name="temporary-upload-urls"></a>
#### 임시 업로드 URL

> [!WARNING]  
> 임시 업로드 URL을 생성하는 기능은 `s3` 드라이버에서만 지원됩니다.

클라이언트 측 애플리케이션에서 직접 파일을 업로드하는 데 사용할 수 있는 임시 URL을 생성해야 하는 경우 `temporaryUploadUrl` 메서드를 사용할 수 있습니다. 이 메서드는 경로와 URL이 만료되어야 하는 시점을 지정하는 `DateTime` 인스턴스를 받습니다. `temporaryUploadUrl` 메서드는 업로드 URL과 업로드 요청에 포함되어야 하는 헤더로 분해될 수 있는 연관 배열을 반환합니다.

```php
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->addMinutes(5)
);
```

이 메서드는 주로 클라이언트 측 애플리케이션이 Amazon S3와 같은 클라우드 스토리지 시스템에 직접 파일을 업로드해야 하는 서버리스 환경에서 유용합니다.

<a name="file-metadata"></a>
### 파일 메타데이터

파일을 읽고 쓰는 것 외에도 Laravel은 파일 자체에 대한 정보를 제공할 수 있습니다. 예를 들어, `size` 메서드는 파일의 크기를 바이트 단위로 가져오는 데 사용될 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

`lastModified` 메서드는 파일이 마지막으로 수정된 시간의 UNIX 타임스탬프를 반환합니다.

```php
$time = Storage::lastModified('file.jpg');
```

주어진 파일의 MIME 유형은 `mimeType` 메서드를 통해 얻을 수 있습니다.

```php
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### 파일 경로

`path` 메서드를 사용하여 주어진 파일의 경로를 가져올 수 있습니다. `local` 드라이버를 사용하는 경우 파일의 절대 경로가 반환됩니다. `s3` 드라이버를 사용하는 경우 S3 버킷 내의 파일에 대한 상대 경로가 반환됩니다.

```php
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## 파일 저장

`put` 메서드는 디스크에 파일 내용을 저장하는 데 사용될 수 있습니다. PHP `resource`를 `put` 메서드에 전달할 수도 있으며, 이는 Flysystem의 기본 스트림 지원을 사용합니다. 모든 파일 경로는 디스크에 설정된 "root" 위치를 기준으로 지정해야 합니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### 쓰기 실패

`put` 메서드(또는 다른 "쓰기" 작업)가 디스크에 파일을 쓸 수 없는 경우 `false`가 반환됩니다.

```php
if (! Storage::put('file.jpg', $contents)) {
    // 파일을 디스크에 쓸 수 없습니다...
}
```

원한다면 파일시스템 디스크의 설정 배열에서 `throw` 옵션을 정의할 수 있습니다. 이 옵션이 `true`로 정의되면 `put`과 같은 "쓰기" 메서드는 쓰기 작업이 실패할 때 `League\Flysystem\UnableToWriteFile` 인스턴스를 발생시킵니다.

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### 파일 앞/뒤에 내용 추가

`prepend` 및 `append` 메서드를 사용하면 파일의 시작 또는 끝에 쓸 수 있습니다.

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### 파일 복사 및 이동

`copy` 메서드는 기존 파일을 디스크의 새 위치로 복사하는 데 사용될 수 있으며, `move` 메서드는 기존 파일의 이름을 바꾸거나 새 위치로 이동하는 데 사용될 수 있습니다.

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### 자동 스트리밍

스토리지로 파일을 스트리밍하면 메모리 사용량이 크게 줄어듭니다. Laravel이 주어진 파일을 스토리지 위치로 자동으로 스트리밍하도록 관리하게 하려면 `putFile` 또는 `putFileAs` 메서드를 사용할 수 있습니다. 이 메서드는 `Illuminate\Http\File` 또는 `Illuminate\Http\UploadedFile` 인스턴스를 받아 파일을 원하는 위치로 자동으로 스트리밍합니다.

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// 파일명에 대해 자동으로 고유 ID 생성...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// 파일명을 수동으로 지정...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

`putFile` 메서드에 대해 몇 가지 중요한 점을 알아야 합니다. 파일명이 아닌 디렉토리 이름만 지정했다는 점을 주목하세요. 기본적으로 `putFile` 메서드는 파일명으로 사용할 고유 ID를 생성합니다. 파일의 확장자는 파일의 MIME 유형을 검사하여 결정됩니다. 파일 경로는 `putFile` 메서드에 의해 반환되므로 생성된 파일명을 포함한 경로를 데이터베이스에 저장할 수 있습니다.

`putFile` 및 `putFileAs` 메서드는 저장된 파일의 "가시성"을 지정하는 인수도 받습니다. 이는 Amazon S3와 같은 클라우드 디스크에 파일을 저장하고 생성된 URL을 통해 파일을 공개적으로 접근 가능하게 하려는 경우 특히 유용합니다.

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### 파일 업로드

웹 애플리케이션에서 파일을 저장하는 가장 일반적인 사용 사례 중 하나는 사진이나 문서와 같은 사용자가 업로드한 파일을 저장하는 것입니다. Laravel은 업로드된 파일 인스턴스의 `store` 메서드를 사용하여 업로드된 파일을 매우 쉽게 저장할 수 있게 합니다. 업로드된 파일을 저장하려는 경로와 함께 `store` 메서드를 호출하면 됩니다.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * 사용자의 아바타를 업데이트합니다.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

이 예제에 대해 몇 가지 중요한 점을 알아야 합니다. 파일명이 아닌 디렉토리 이름만 지정했다는 점을 주목하세요. 기본적으로 `store` 메서드는 파일명으로 사용할 고유 ID를 생성합니다. 파일의 확장자는 파일의 MIME 유형을 검사하여 결정됩니다. 파일 경로는 `store` 메서드에 의해 반환되므로 생성된 파일명을 포함한 경로를 데이터베이스에 저장할 수 있습니다.

위의 예제와 동일한 파일 저장 작업을 수행하기 위해 `Storage` 파사드의 `putFile` 메서드를 호출할 수도 있습니다.

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### 파일명 지정

저장된 파일에 자동으로 파일명이 할당되는 것을 원하지 않는 경우, 경로, 파일명, (선택적) 디스크를 인수로 받는 `storeAs` 메서드를 사용할 수 있습니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

위의 예제와 동일한 파일 저장 작업을 수행하기 위해 `Storage` 파사드의 `putFileAs` 메서드를 사용할 수도 있습니다.

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]  
> 인쇄할 수 없는 문자와 유효하지 않은 유니코드 문자는 파일 경로에서 자동으로 제거됩니다. 따라서 Laravel의 파일 저장 메서드에 전달하기 전에 파일 경로를 정리하고 싶을 수 있습니다. 파일 경로는 `League\Flysystem\WhitespacePathNormalizer::normalizePath` 메서드를 사용하여 정규화됩니다.

<a name="specifying-a-disk"></a>
#### 디스크 지정

기본적으로 업로드된 파일의 `store` 메서드는 기본 디스크를 사용합니다. 다른 디스크를 지정하려면 `store` 메서드의 두 번째 인수로 디스크 이름을 전달하세요.

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

`storeAs` 메서드를 사용하는 경우 메서드의 세 번째 인수로 디스크 이름을 전달할 수 있습니다.

```php
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### 기타 업로드된 파일 정보

업로드된 파일의 원래 이름과 확장자를 가져오려면 `getClientOriginalName` 및 `getClientOriginalExtension` 메서드를 사용할 수 있습니다.

```php
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

그러나 `getClientOriginalName` 및 `getClientOriginalExtension` 메서드는 파일 이름과 확장자가 악의적인 사용자에 의해 변조될 수 있으므로 안전하지 않은 것으로 간주됩니다. 이러한 이유로 주어진 파일 업로드에 대한 이름과 확장자를 가져오기 위해 일반적으로 `hashName` 및 `extension` 메서드를 선호해야 합니다.

```php
$file = $request->file('avatar');

$name = $file->hashName(); // 고유하고 무작위한 이름 생성...
$extension = $file->extension(); // 파일의 MIME 유형을 기반으로 파일 확장자 결정...
```

<a name="file-visibility"></a>
### 파일 가시성

Laravel의 Flysystem 통합에서 "가시성(visibility)"은 여러 플랫폼에 걸친 파일 권한의 추상화입니다. 파일은 `public` 또는 `private`로 선언될 수 있습니다. 파일이 `public`으로 선언되면 해당 파일이 일반적으로 다른 사람들이 접근할 수 있어야 함을 나타냅니다. 예를 들어, S3 드라이버를 사용할 때 `public` 파일에 대한 URL을 조회할 수 있습니다.

`put` 메서드를 통해 파일을 작성할 때 가시성을 설정할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

파일이 이미 저장된 경우 `getVisibility` 및 `setVisibility` 메서드를 통해 가시성을 조회하고 설정할 수 있습니다.

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

업로드된 파일과 상호 작용할 때 `storePublicly` 및 `storePubliclyAs` 메서드를 사용하여 `public` 가시성으로 업로드된 파일을 저장할 수 있습니다.

```php
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="local-files-and-visibility"></a>
#### 로컬 파일과 가시성

`local` 드라이버를 사용할 때 `public` [가시성](#file-visibility)은 디렉토리의 경우 `0755` 권한으로, 파일의 경우 `0644` 권한으로 변환됩니다. 애플리케이션의 `filesystems` 설정 파일에서 권한 매핑을 수정할 수 있습니다.

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'permissions' => [
        'file' => [
            'public' => 0644,
            'private' => 0600,
        ],
        'dir' => [
            'public' => 0755,
            'private' => 0700,
        ],
    ],
    'throw' => false,
],
```

<a name="deleting-files"></a>
## 파일 삭제

`delete` 메서드는 단일 파일명 또는 삭제할 파일 배열을 받습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

필요한 경우 파일을 삭제해야 하는 디스크를 지정할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## 디렉토리

<a name="get-all-files-within-a-directory"></a>
#### 디렉토리 내 모든 파일 가져오기

`files` 메서드는 주어진 디렉토리 내의 모든 파일 배열을 반환합니다. 하위 디렉토리를 포함하여 주어진 디렉토리 내의 모든 파일 목록을 조회하려면 `allFiles` 메서드를 사용할 수 있습니다.

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### 디렉토리 내 모든 디렉토리 가져오기

`directories` 메서드는 주어진 디렉토리 내의 모든 디렉토리 배열을 반환합니다. 하위 디렉토리를 포함하여 주어진 디렉토리 내의 모든 디렉토리 목록을 조회하려면 `allDirectories` 메서드를 사용할 수 있습니다.

```php
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### 디렉토리 생성

`makeDirectory` 메서드는 필요한 모든 하위 디렉토리를 포함하여 주어진 디렉토리를 생성합니다.

```php
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### 디렉토리 삭제

마지막으로 `deleteDirectory` 메서드는 디렉토리와 모든 파일을 제거하는 데 사용될 수 있습니다.

```php
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## 테스트

`Storage` 파사드의 `fake` 메서드를 사용하면 `Illuminate\Http\UploadedFile` 클래스의 파일 생성 유틸리티와 결합하여 파일 업로드 테스트를 크게 단순화하는 가짜 디스크를 쉽게 생성할 수 있습니다. 예를 들어:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('albums can be uploaded', function () {
    Storage::fake('photos');

    $response = $this->json('POST', '/photos', [
        UploadedFile::fake()->image('photo1.jpg'),
        UploadedFile::fake()->image('photo2.jpg')
    ]);

    // 하나 이상의 파일이 저장되었는지 확인...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // 하나 이상의 파일이 저장되지 않았는지 확인...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // 주어진 디렉토리의 파일 수가 예상 수와 일치하는지 확인...
    Storage::disk('photos')->assertCount('/wallpapers', 2);

    // 주어진 디렉토리가 비어 있는지 확인...
    Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_albums_can_be_uploaded(): void
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // 하나 이상의 파일이 저장되었는지 확인...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // 하나 이상의 파일이 저장되지 않았는지 확인...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // 주어진 디렉토리의 파일 수가 예상 수와 일치하는지 확인...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // 주어진 디렉토리가 비어 있는지 확인...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');
    }
}
```

기본적으로 `fake` 메서드는 임시 디렉토리의 모든 파일을 삭제합니다. 이 파일들을 유지하려면 대신 "persistentFake" 메서드를 사용할 수 있습니다. 파일 업로드 테스트에 대한 자세한 내용은 [HTTP 테스트 문서의 파일 업로드 관련 정보](/docs/{{version}}/http-tests#testing-file-uploads)를 참조하세요.

> [!WARNING]  
> `image` 메서드를 사용하려면 [GD 확장](https://www.php.net/manual/en/book.image.php)이 필요합니다.

<a name="custom-filesystems"></a>
## 커스텀 파일시스템

Laravel의 Flysystem 통합은 기본적으로 여러 "드라이버"를 지원합니다. 그러나 Flysystem은 이것에 국한되지 않으며 다른 많은 스토리지 시스템을 위한 어댑터를 가지고 있습니다. Laravel 애플리케이션에서 이러한 추가 어댑터 중 하나를 사용하려면 커스텀 드라이버를 생성할 수 있습니다.

커스텀 파일시스템을 정의하려면 Flysystem 어댑터가 필요합니다. 커뮤니티에서 유지 관리하는 Dropbox 어댑터를 프로젝트에 추가해 보겠습니다.

```shell
composer require spatie/flysystem-dropbox
```

다음으로, 애플리케이션의 [서비스 프로바이더](/docs/{{version}}/providers) 중 하나의 `boot` 메서드 내에서 드라이버를 등록할 수 있습니다. 이를 위해 `Storage` 파사드의 `extend` 메서드를 사용해야 합니다.

```php
<?php

namespace App\Providers;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * 애플리케이션 서비스를 등록합니다.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * 애플리케이션 서비스를 부트스트랩합니다.
     */
    public function boot(): void
    {
        Storage::extend('dropbox', function (Application $app, array $config) {
            $adapter = new DropboxAdapter(new DropboxClient(
                $config['authorization_token']
            ));

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config
            );
        });
    }
}
```

`extend` 메서드의 첫 번째 인수는 드라이버의 이름이고 두 번째는 `$app` 및 `$config` 변수를 받는 클로저입니다. 클로저는 `Illuminate\Filesystem\FilesystemAdapter`의 인스턴스를 반환해야 합니다. `$config` 변수에는 지정된 디스크에 대해 `config/filesystems.php`에 정의된 값이 포함됩니다.

확장의 서비스 프로바이더를 생성하고 등록한 후에는 `config/filesystems.php` 설정 파일에서 `dropbox` 드라이버를 사용할 수 있습니다.
