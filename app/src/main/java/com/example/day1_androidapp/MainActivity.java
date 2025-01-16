package com.example.day1_androidapp;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

//        RecyclerView recyclerView = findViewById(R.id.recyclerView);
//        try {
//            List<String> data = new ArrayList<>();
//            for (int i = 1; i <= 200; i++) {
//                data.add("Item " + i);
//            }
//
//            if (data != null && !data.isEmpty()) {
//                Log.d("RecyclerView", "Data is available, setting up adapter.");
//                recyclerView.setLayoutManager(new LinearLayoutManager(this));
//                recyclerView.setAdapter(new RecyclerAdapter(data));
//            } else {
//                Log.d("RecyclerView", "Data is empty or null.");
//                Toast.makeText(this, "Data is not available", Toast.LENGTH_SHORT).show();
//            }
//        } catch (Exception e) {
//            Log.e("RecyclerViewError", "Error initializing RecyclerView", e);
//            Toast.makeText(this, "So-Sorry Some Error", Toast.LENGTH_SHORT).show();
//        }
    }
}
