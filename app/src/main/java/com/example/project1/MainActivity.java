package com.example.project1;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.app.Activity;
import android.content.Intent;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {
    private Button favoritePlaceButton;
    private Button phoneModelButton;
    final static String TAG = "MainActivity";
    public static List<Address> addresses;
    FusedLocationProviderClient fusedLocationProviderClient;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);

        favoritePlaceButton = findViewById(R.id.favourite_place_button);
        favoritePlaceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Log.d(TAG, "Trying to open Google Maps");
                Intent mapsIntent = new Intent(MainActivity.this, MapsActivity.class);
                startActivity(mapsIntent);
            }
        });

        phoneModelButton = findViewById(R.id.phone_model_button);
        phoneModelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //getLocation();
                openNewWindow();
            }
        });
    }

    public void getLocation() {
        fusedLocationProviderClient.getLastLocation().addOnCompleteListener(new OnCompleteListener<Location>() {
            @Override
            public void onComplete(@NonNull Task<Location> task) {
                Location location = task.getResult();
                if (location != null) {
                    Geocoder geocoder = new Geocoder(MainActivity.this,
                            Locale.getDefault());
                    try {
                        List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(),1);

                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    private void openNewWindow() {
        Intent displayIntent = new Intent(MainActivity.this, DisplayInformation.class);
        startActivity(displayIntent);
    }



}