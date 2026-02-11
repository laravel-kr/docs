# HTTP 리다이렉트

- [리다이렉트 생성하기](#creating-redirects)
- [이름이 지정된 라우트로 리다이렉트하기](#redirecting-named-routes)
- [컨트롤러 액션으로 리다이렉트하기](#redirecting-controller-actions)
- [세션의 임시 데이터와 함께 리다이렉트하기](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## 리다이렉트 생성하기

리다이렉트 응답은 `Illuminate\Http\RedirectResponse` 클래스의 인스턴스이며, 사용자를 다른 URL로 리다이렉트하는 데 필요한 적절한 헤더를 포함합니다. `RedirectResponse` 인스턴스를 생성하는 방법은 여러 가지가 있습니다. 가장 간단한 방법은 글로벌 `redirect` 헬퍼를 사용하는 것입니다.

    Route::get('/dashboard', function () {
        return redirect('/home/dashboard');
    });

때로는 제출한 양식이 유효하지 않을 때처럼 사용자를 이전 위치로 리다이렉트하고 싶을 수 있습니다. 이 경우 글로벌 `back` 헬퍼 함수를 사용할 수 있습니다. 이 기능은 [세션](/docs/{{version}}/session)을 활용하므로, `back` 함수를 호출하는 라우트가 `web` 미들웨어 그룹을 사용하거나 모든 세션 미들웨어가 적용되어 있어야 합니다.

    Route::post('/user/profile', function () {
        // 요청 유효성 검사...

        return back()->withInput();
    });

<a name="redirecting-named-routes"></a>
## 이름이 지정된 라우트로 리다이렉트하기

`redirect` 헬퍼를 파라미터 없이 호출하면 `Illuminate\Routing\Redirector` 인스턴스가 반환되어, `Redirector` 인스턴스의 모든 메서드를 호출할 수 있습니다. 예를 들어, 이름이 지정된 라우트에 대한 `RedirectResponse`를 생성하려면 `route` 메서드를 사용할 수 있습니다.

    return redirect()->route('login');

라우트에 파라미터가 있는 경우, `route` 메서드의 두 번째 인수로 전달할 수 있습니다.

    // URI가 다음과 같은 라우트의 경우: profile/{id}

    return redirect()->route('profile', ['id' => 1]);

편의를 위해 라라벨은 글로벌 `to_route` 함수도 제공합니다.

    return to_route('profile', ['id' => 1]);

<a name="populating-parameters-via-eloquent-models"></a>
#### Eloquent 모델을 통한 파라미터 채우기

Eloquent 모델에서 "ID" 파라미터가 채워지는 라우트로 리다이렉트하는 경우, 모델 자체를 전달할 수 있습니다. ID는 자동으로 추출됩니다.

    // URI가 다음과 같은 라우트의 경우: profile/{id}

    return redirect()->route('profile', [$user]);

라우트 파라미터에 배치되는 값을 커스터마이즈하려면 Eloquent 모델의 `getRouteKey` 메서드를 오버라이드해야 합니다.

    /**
     * 모델의 라우트 키 값을 가져옵니다.
     */
    public function getRouteKey(): mixed
    {
        return $this->slug;
    }

<a name="redirecting-controller-actions"></a>
## 컨트롤러 액션으로 리다이렉트하기

[컨트롤러 액션](/docs/{{version}}/controllers)으로의 리다이렉트를 생성할 수도 있습니다. 이를 위해 `action` 메서드에 컨트롤러와 액션 이름을 전달합니다.

    use App\Http\Controllers\HomeController;

    return redirect()->action([HomeController::class, 'index']);

컨트롤러 라우트에 파라미터가 필요한 경우, `action` 메서드의 두 번째 인수로 전달할 수 있습니다.

    return redirect()->action(
        [UserController::class, 'profile'], ['id' => 1]
    );

<a name="redirecting-with-flashed-session-data"></a>
## 세션의 임시 데이터와 함께 리다이렉트하기

새로운 URL로 리다이렉트하면서 [세션에 데이터를 임시 저장](/docs/{{version}}/session#flash-data)하는 것은 일반적으로 동시에 수행됩니다. 보통 이 작업은 성공 메시지를 세션에 임시 저장할 때 수행됩니다. 편의를 위해, `RedirectResponse` 인스턴스를 생성하고 플루언트 메서드 체인으로 세션에 데이터를 임시 저장할 수 있습니다.

    Route::post('/user/profile', function () {
        // 사용자 프로필 업데이트...

        return redirect('/dashboard')->with('status', 'Profile updated!');
    });

`RedirectResponse` 인스턴스가 제공하는 `withInput` 메서드를 사용하여 사용자를 새 위치로 리다이렉트하기 전에 현재 요청의 입력 데이터를 세션에 임시 저장할 수 있습니다. 입력이 세션에 임시 저장되면, 다음 요청에서 쉽게 [가져올 수 있습니다](/docs/{{version}}/requests#retrieving-old-input).

    return back()->withInput();

사용자가 리다이렉트된 후, [세션](/docs/{{version}}/session)에서 임시 저장된 메시지를 표시할 수 있습니다. 예를 들어, [Blade 구문](/docs/{{version}}/blade)을 사용하면 다음과 같습니다.

    @if (session('status'))
        <div class="alert alert-success">
            {{ session('status') }}
        </div>
    @endif
