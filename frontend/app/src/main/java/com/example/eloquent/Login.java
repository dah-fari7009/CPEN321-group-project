package com.example.eloquent;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

public class Login extends AppCompatActivity {

    private GoogleSignInClient mGoogleSignInClient;
    private Integer RC_SIGN_IN = 1;
    final static String TAG = "Login";
    private Router router;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Dev login button, to bypass google sign-in
        Button loginButton = findViewById(R.id.LB);
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent usingIntent = new Intent(Login.this, MainActivity.class);
                startActivity(usingIntent);

            }
        });

        router = Router.getInstance(getApplicationContext());

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.google_oauth2_web_client_id))
                .requestEmail()
                .build();

        // check for already signed-in Google user
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        updateUI(account);

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        findViewById(R.id.sign_in_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                signIn();

            }
        });
    }


    private void signIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            // The Task returned from this call is always completed, no need to attach
            // a listener.
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }

    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            // Signed in successfully, show authenticated UI.
            updateUI(account);
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            updateUI(null);
        }
    }


    @Override
    protected void onStart() {
        super.onStart();
        // Check for existing Google Sign In account, if the user is already signed in
        // the GoogleSignInAccount will be non-null.
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        updateUI(account);
    }

    private void updateUI(GoogleSignInAccount account) {
        // Create user from account
        if (account == null) {
            // No Google account already signed into on the device.
            router.createUser(account.getIdToken(), false, account.getId(), account.getEmail());
        } else {
            // The account.getIdToken() method will get an old (expired) Id token, since the user
            // remains signed-in from before.
            router.createUser(account.getIdToken(), true, account.getId(), account.getEmail());
        }
        // Logging for debugging
        Log.d(TAG, "Id token: " + account.getIdToken());
        Log.d(TAG, "Pref name: " + account.getDisplayName());
        Log.d(TAG, "Email: " + account.getEmail());
        Log.d(TAG, "Family name: " + account.getFamilyName());
        Log.d(TAG, "Given name: " + account.getGivenName());
        Log.d(TAG, "Display URL: " + account.getPhotoUrl());

        // Go to main activity
        openMainActivity();
    }


    private void openMainActivity() {
        Intent usingIntent = new Intent(Login.this, MainActivity.class);
        startActivity(usingIntent);
    }
}