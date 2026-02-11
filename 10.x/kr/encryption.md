# 암호화(Encryption)

- [소개](#introduction)
- [설정](#configuration)
- [암호화 도구 사용하기](#using-the-encrypter)

<a name="introduction"></a>
## 소개

Laravel의 암호화 서비스는 OpenSSL을 사용하여 AES-256 및 AES-128 암호화를 통해 텍스트를 암호화하고 복호화하는 간단하고 편리한 인터페이스를 제공합니다. Laravel의 모든 암호화된 값은 메시지 인증 코드(MAC)를 사용하여 서명되므로, 한 번 암호화된 값의 기본 데이터는 수정되거나 변조될 수 없습니다.

<a name="configuration"></a>
## 설정

Laravel의 암호화 도구를 사용하기 전에, `config/app.php` 설정 파일에서 `key` 설정 옵션을 설정해야 합니다. 이 설정 값은 `APP_KEY` 환경 변수에 의해 결정됩니다. `key:generate` 명령어가 PHP의 안전한 난수 바이트 생성기를 사용하여 애플리케이션에 암호학적으로 안전한 키를 생성하므로, `php artisan key:generate` 명령어를 사용하여 이 변수의 값을 생성해야 합니다. 일반적으로 `APP_KEY` 환경 변수의 값은 [Laravel 설치](/docs/{{version}}/installation) 중에 자동으로 생성됩니다.

<a name="using-the-encrypter"></a>
## 암호화 도구 사용하기

<a name="encrypting-a-value"></a>
#### 값 암호화하기

`Crypt` 파사드가 제공하는 `encryptString` 메소드를 사용하여 값을 암호화할 수 있습니다. 모든 암호화된 값은 OpenSSL과 AES-256-CBC 암호를 사용하여 암호화됩니다. 또한, 모든 암호화된 값은 메시지 인증 코드(MAC)로 서명됩니다. 통합된 메시지 인증 코드는 악의적인 사용자가 변조한 값의 복호화를 방지합니다.

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Crypt;

    class DigitalOceanTokenController extends Controller
    {
        /**
         * 사용자의 DigitalOcean API 토큰을 저장합니다.
         */
        public function store(Request $request): RedirectResponse
        {
            $request->user()->fill([
                'token' => Crypt::encryptString($request->token),
            ])->save();

            return redirect('/secrets');
        }
    }

<a name="decrypting-a-value"></a>
#### 값 복호화하기

`Crypt` 파사드가 제공하는 `decryptString` 메소드를 사용하여 값을 복호화할 수 있습니다. 메시지 인증 코드가 유효하지 않은 경우와 같이 값을 제대로 복호화할 수 없는 경우, `Illuminate\Contracts\Encryption\DecryptException` 예외가 발생합니다.

    use Illuminate\Contracts\Encryption\DecryptException;
    use Illuminate\Support\Facades\Crypt;

    try {
        $decrypted = Crypt::decryptString($encryptedValue);
    } catch (DecryptException $e) {
        // ...
    }
