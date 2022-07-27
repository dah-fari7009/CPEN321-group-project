package com.example.eloquent;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import java.util.HashMap;
import java.util.Map;

public class Login extends AppCompatActivity {

    private GoogleSignInClient mGoogleSignInClient;
    private Integer RC_SIGN_IN = 1;
    final static String TAG = "Login";
//    private Router router;
    private String BACKEND_HOST_AND_PORT = "http://20.104.77.70:8081";
    private static RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        /* Dev login button, to bypass google sign-in */
        Button loginButton = findViewById(R.id.LB);
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                createUserAndGoToMainActivity("0", true, "104866131128716891939", "aswin.sai009.dummy@gmail.com");
            }
        });

        /* set up HTTP requests */
//        router = Router.getInstance(getApplicationContext());
        requestQueue = Volley.newRequestQueue(getApplicationContext());

        /* Google sign-in */
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.google_oauth2_web_client_id))
                .requestEmail()
                .build();

        // check for already signed-in Google user, before setting up sign-in button
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            updateUI(account, true);
        } else {
            mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

            findViewById(R.id.sign_in_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    signIn();
                }
            });
        }
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
            updateUI(account, false);
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            updateUI(null, false);
        }
    }


//    @Override
//    protected void onStart() {
//        super.onStart();
//        // Check for existing Google Sign In account, if the user is already signed in
//        // the GoogleSignInAccount will be non-null.
//        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
//        updateUI(account, false);
//    }

    private void updateUI(GoogleSignInAccount account, Boolean previouslySignedIn) {
        // Create user from account
        if (account != null) {
            // Logging for debugging
            Log.d(TAG, "Id token: " + account.getIdToken());
            Log.d(TAG, "Pref name: " + account.getDisplayName());
            Log.d(TAG, "Email: " + account.getEmail());
            Log.d(TAG, "Family name: " + account.getFamilyName());
            Log.d(TAG, "Given name: " + account.getGivenName());
            Log.d(TAG, "Display URL: " + account.getPhotoUrl());

            // The account.getIdToken() method will get an old (expired) Id token if there exists a
            // signed-in Google account on the device from a previous session.
            createUserAndGoToMainActivity(account.getIdToken(), previouslySignedIn, account.getId(), account.getEmail());
        }
    }

    private void openMainActivity() {
        Intent usingIntent = new Intent(Login.this, MainActivity.class);
        startActivity(usingIntent);
    }

    private void createUserAndGoToMainActivity(String IdToken, Boolean googleAccountPreviouslySignedIn, String userID, String username) {
        //ObjectMapper objectMapper = new ObjectMapper();
        String url = BACKEND_HOST_AND_PORT + "/api/login";
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d(TAG, response);
                User user = User.getInstance();
                user.setData(response);
                Log.d(TAG, user.getData().getUserID() + " " + user.getData().getUsername());
                // Go to main activity
                openMainActivity();
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d(TAG,error.toString());
            }
        }) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("token", IdToken);
                params.put("userID", userID);
                params.put("username", username);
                if (googleAccountPreviouslySignedIn) {
                    params.put("verifiedDevice", "true");
                } else {
                    params.put("verifiedDevice", "false");
                }
                return params;
            }
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Content-Type", "application/x-www-form-urlencoded");
                return headers;
            }
        };

        requestQueue.add(stringRequest);
    }


}