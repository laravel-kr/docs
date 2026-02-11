# 해싱(Hashing)

- [소개](#introduction)
- [설정](#configuration)
- [기본 사용법](#basic-usage)
    - [비밀번호 해싱](#hashing-passwords)
    - [비밀번호가 해시와 일치하는지 확인](#verifying-that-a-password-matches-a-hash)
    - [비밀번호 재해싱 필요 여부 확인](#determining-if-a-password-needs-to-be-rehashed)
- [해시 알고리즘 검증](#hash-algorithm-verification)

<a name="introduction"></a>
## 소개

Laravel의 `Hash` [파사드(Facade)](/docs/{{version}}/facades)는 사용자 비밀번호를 저장하기 위한 안전한 Bcrypt 및 Argon2 해싱을 제공합니다. [Laravel 애플리케이션 스타터 킷](/docs/{{version}}/starter-kits) 중 하나를 사용하는 경우, 기본적으로 회원가입과 인증에 Bcrypt가 사용됩니다.

Bcrypt는 "작업 계수(work factor)"를 조절할 수 있기 때문에 비밀번호 해싱에 탁월한 선택입니다. 이는 하드웨어 성능이 향상됨에 따라 해시를 생성하는 데 걸리는 시간을 늘릴 수 있다는 것을 의미합니다. 비밀번호를 해싱할 때는 느린 것이 좋습니다. 알고리즘이 비밀번호를 해싱하는 데 더 오래 걸릴수록, 악의적인 사용자가 애플리케이션에 대한 무차별 대입 공격에 사용될 수 있는 모든 가능한 문자열 해시 값의 "레인보우 테이블(rainbow table)"을 생성하는 데 더 오래 걸립니다.

<a name="configuration"></a>
## 설정

기본적으로 Laravel은 데이터를 해싱할 때 `bcrypt` 해싱 드라이버를 사용합니다. 그러나 [`argon`](https://en.wikipedia.org/wiki/Argon2) 및 [`argon2id`](https://en.wikipedia.org/wiki/Argon2)를 포함한 여러 다른 해싱 드라이버도 지원됩니다.

`HASH_DRIVER` 환경 변수를 사용하여 애플리케이션의 해싱 드라이버를 지정할 수 있습니다. 하지만 Laravel의 모든 해싱 드라이버 옵션을 커스터마이징하려면 `config:publish` Artisan 명령어를 사용하여 전체 `hashing` 설정 파일을 퍼블리시해야 합니다.

```bash
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## 기본 사용법

<a name="hashing-passwords"></a>
### 비밀번호 해싱

`Hash` 파사드의 `make` 메서드를 호출하여 비밀번호를 해싱할 수 있습니다.

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\RedirectResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;

    class PasswordController extends Controller
    {
        /**
         * 사용자의 비밀번호를 업데이트합니다.
         */
        public function update(Request $request): RedirectResponse
        {
            // 새 비밀번호 길이 검증...

            $request->user()->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();

            return redirect('/profile');
        }
    }

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Bcrypt 작업 계수 조정

Bcrypt 알고리즘을 사용하는 경우, `make` 메서드를 통해 `rounds` 옵션을 사용하여 알고리즘의 작업 계수를 관리할 수 있습니다. 그러나 Laravel이 관리하는 기본 작업 계수는 대부분의 애플리케이션에 적합합니다.

    $hashed = Hash::make('password', [
        'rounds' => 12,
    ]);

<a name="adjusting-the-argon2-work-factor"></a>
#### Argon2 작업 계수 조정

Argon2 알고리즘을 사용하는 경우, `make` 메서드를 통해 `memory`, `time`, `threads` 옵션을 사용하여 알고리즘의 작업 계수를 관리할 수 있습니다. 그러나 Laravel이 관리하는 기본값은 대부분의 애플리케이션에 적합합니다.

    $hashed = Hash::make('password', [
        'memory' => 1024,
        'time' => 2,
        'threads' => 2,
    ]);

> [!NOTE]  
> 이러한 옵션에 대한 자세한 내용은 [Argon 해싱에 관한 공식 PHP 문서](https://secure.php.net/manual/en/function.password-hash.php)를 참조하세요.

<a name="verifying-that-a-password-matches-a-hash"></a>
### 비밀번호가 해시와 일치하는지 확인

`Hash` 파사드가 제공하는 `check` 메서드를 사용하면 주어진 평문 문자열이 주어진 해시와 일치하는지 확인할 수 있습니다.

    if (Hash::check('plain-text', $hashedPassword)) {
        // 비밀번호가 일치합니다...
    }

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### 비밀번호 재해싱 필요 여부 확인

`Hash` 파사드가 제공하는 `needsRehash` 메서드를 사용하면 비밀번호가 해싱된 이후 해셔(hasher)가 사용하는 작업 계수가 변경되었는지 확인할 수 있습니다. 일부 애플리케이션은 인증 과정에서 이 검사를 수행하기도 합니다.

    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }

<a name="hash-algorithm-verification"></a>
## 해시 알고리즘 검증

해시 알고리즘 조작을 방지하기 위해 Laravel의 `Hash::check` 메서드는 먼저 주어진 해시가 애플리케이션에서 선택한 해싱 알고리즘을 사용하여 생성되었는지 확인합니다. 알고리즘이 다른 경우 `RuntimeException` 예외가 발생합니다.

이것은 대부분의 애플리케이션에서 예상되는 동작이며, 해싱 알고리즘이 변경될 것으로 예상되지 않고 다른 알고리즘은 악의적인 공격의 징후일 수 있습니다. 그러나 한 알고리즘에서 다른 알고리즘으로 마이그레이션하는 경우와 같이 애플리케이션 내에서 여러 해싱 알고리즘을 지원해야 하는 경우, `HASH_VERIFY` 환경 변수를 `false`로 설정하여 해시 알고리즘 검증을 비활성화할 수 있습니다.

```ini
HASH_VERIFY=false
```
