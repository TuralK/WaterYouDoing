package com.wateryoudoing_app

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import com.google.firebase.messaging.FirebaseMessaging
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "WaterYouDoing"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)

    FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
      if (!task.isSuccessful) {
        Log.w(TAG, "Fetching FCM registration token failed", task.exception)
        return@addOnCompleteListener
      }

      val token = task.result
      val msg = "FCM token: $token"
      Log.d(TAG, msg)
      Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  companion object {
    private const val TAG = "MainActivity"
  }
}
