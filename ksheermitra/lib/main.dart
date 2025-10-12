import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme_config.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: KsheerMitraApp(),
    ),
  );
}

class KsheerMitraApp extends StatelessWidget {
  const KsheerMitraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KsheerMitra',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
      },
    );
  }
}
