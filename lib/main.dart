import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GearGuard - Maintenance Tracker',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A122A),
        cardColor: const Color(0xFF1A233F),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1A233F),
          elevation: 0,
        ),
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.hasData) {
          return  HomeScreen();
        }
        return const LoginScreen();
      },
    );
  }
}

// ==================== LOGIN SCREEN (unchanged) ====================

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _isLoading = false;
  String? _error;

  Future<void> _signIn() async {
    setState(() => {_isLoading = true, _error = null});
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
    } on FirebaseAuthException catch (e) {
      setState(() => _error = e.message ?? 'Sign in failed');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signUp() async {
    setState(() => {_isLoading = true, _error = null});
    try {
      await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
    } on FirebaseAuthException catch (e) {
      setState(() => _error = e.message ?? 'Sign up failed');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Welcome Back', style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              Text('Sign in to continue', style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.7))),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A233F).withOpacity(0.9),
                  borderRadius: BorderRadius.circular(32),
                ),
                child: Column(
                  children: [
                    _buildTextField(_emailController, 'Email', false),
                    const SizedBox(height: 20),
                    _buildTextField(_passwordController, 'Password', true),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Checkbox(value: _rememberMe, onChanged: (v) => setState(() => _rememberMe = v!), activeColor: Colors.white),
                            const Text('Remember me', style: TextStyle(color: Colors.white)),
                          ],
                        ),
                        TextButton(onPressed: () {}, child: const Text('Forgot password?', style: TextStyle(color: Colors.white70))),
                      ],
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _signIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2A3453),
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Sign In', style: TextStyle(fontSize: 18, color: Colors.white)),
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 16),
                      Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 48),
              TextButton(
                onPressed: _signUp,
                child: Text.rich(
                  TextSpan(
                    text: "Don't have an account? ",
                    style: TextStyle(color: Colors.white.withOpacity(0.7)),
                    children: const [TextSpan(text: 'Sign up', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, bool obscure) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(color: const Color(0xFF2A3453), borderRadius: BorderRadius.circular(30)),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: Colors.white54), border: InputBorder.none),
        keyboardType: hint == 'Email' ? TextInputType.emailAddress : TextInputType.text,
      ),
    );
  }
}

// ==================== FINAL FIXED HOME SCREEN - NO OVERFLOW EVEN ON iPHONE SE ====================

class HomeScreen extends StatelessWidget {
   HomeScreen({super.key});

  final int totalEquipment = 18;
  final int activeRequests = 7;
  final int totalTeams = 5;
  final int totalTechnicians = 6;

  final List<Map<String, dynamic>> recentRequests = [
    {"title": "Generator fails to take load", "equipment": "Diesel Generator 750 KVA", "priority": "CRITICAL", "status": "NEW", "date": "Dec 30, 2025"},
    {"title": "Intermittent packet loss on core switch", "equipment": "Cisco Catalyst 9300 Switch", "priority": "HIGH", "status": "IN_PROGRESS", "date": "Today"},
    {"title": "Chiller trip on low refrigerant", "equipment": "Central Chiller 120 TR", "priority": "HIGH", "status": "IN_PROGRESS", "date": "Dec 24, 2025"},
    {"title": "Frequent paper jam in MFP", "equipment": "HP LaserJet Pro MFP", "priority": "MEDIUM", "status": "NEW", "date": "Jan 02, 2026"},
  ];

  final List<Map<String, dynamic>> criticalEquipment = [
    {"name": "Diesel Generator 750 KVA", "location": "Mumbai Plant - DG Yard", "status": "OPERATIONAL"},
    {"name": "Palo Alto Firewall", "location": "Delhi HQ - Security Room", "status": "OPERATIONAL"},
    {"name": "Cisco Catalyst 9300 Switch", "location": "Bengaluru Office", "status": "UNDER_MAINTENANCE"},
    {"name": "Central Chiller 120 TR", "location": "Gurugram Office", "status": "OPERATIONAL"},
    {"name": "11kV Distribution Panel", "location": "Delhi HQ", "status": "OPERATIONAL"},
  ];

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case "CRITICAL": return Colors.red.shade400;
      case "HIGH": return Colors.orange.shade400;
      case "MEDIUM": return Colors.amber.shade400;
      default: return Colors.green.shade400;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case "NEW": return Colors.blue.shade400;
      case "IN_PROGRESS": return Colors.purple.shade400;
      case "REPAIRED": return Colors.green.shade400;
      case "UNDER_MAINTENANCE": return Colors.orange.shade400;
      default: return Colors.grey.shade400;
    }
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1A233F),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 3))],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.8)),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser!;
    final String userName = user.email?.split('@').first.replaceAll('.', ' ') ?? 'User';
    final String capitalizedName = userName.split(' ').map((str) => str.isEmpty ? '' : str[0].toUpperCase() + str.substring(1)).join(' ');

    return Scaffold(
      appBar: AppBar(
        title: const Text('GearGuard'),
        centerTitle: false,
        actions: [
          IconButton(icon: const Icon(Icons.logout_rounded), onPressed: () => FirebaseAuth.instance.signOut()),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => await Future.delayed(const Duration(seconds: 1)),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hello, $capitalizedName 👋', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 6),
              Text('Current date: December 27, 2025', style: TextStyle(fontSize: 15, color: Colors.white.withOpacity(0.7))),
              const SizedBox(height: 24),

              // Ultra-responsive grid - taller cards on small screens
              LayoutBuilder(
                builder: (context, constraints) {
                  final bool isVerySmall = constraints.maxWidth < 380; // Covers iPhone SE & similar
                  final int crossAxisCount = 2;
                  final double childAspectRatio = isVerySmall ? 1.7 : 1.55; // Even taller if needed
                  return GridView(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxisCount,
                      childAspectRatio: childAspectRatio,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                    ),
                    children: [
                      _buildMetricCard('Total Equipment', totalEquipment.toString(), Icons.precision_manufacturing_rounded, Colors.blueAccent),
                      _buildMetricCard('Active Requests', activeRequests.toString(), Icons.assignment_late_rounded, Colors.orangeAccent),
                      _buildMetricCard('Teams', totalTeams.toString(), Icons.groups_rounded, Colors.greenAccent),
                      _buildMetricCard('Technicians', totalTechnicians.toString(), Icons.engineering_rounded, Colors.purpleAccent),
                    ],
                  );
                },
              ),

              const SizedBox(height: 32),

              const Text('Recent Maintenance Requests', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              ...recentRequests.map((req) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A233F),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 6, offset: const Offset(0, 3))],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(radius: 20, backgroundColor: _getPriorityColor(req['priority']).withOpacity(0.2), child: Text(req['priority'][0], style: TextStyle(color: _getPriorityColor(req['priority']), fontWeight: FontWeight.bold, fontSize: 14))),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(req['title'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white), maxLines: 2, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Text(req['equipment'], style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.7)), maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Text(req['date'], style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5))),
                            ],
                          ),
                        ),
                        Chip(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          label: Text(req['status'].replaceAll('_', ' '), style: const TextStyle(fontSize: 10)),
                          backgroundColor: _getStatusColor(req['status']).withOpacity(0.2),
                          labelStyle: TextStyle(color: _getStatusColor(req['status']), fontSize: 10),
                        ),
                      ],
                    ),
                  )),

              const SizedBox(height: 32),

              const Text('Critical Equipment Status', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),
              ...criticalEquipment.map((eq) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A233F),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 6, offset: const Offset(0, 3))],
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.computer_rounded, size: 34, color: _getStatusColor(eq['status'])),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(eq['name'], style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                              const SizedBox(height: 4),
                              Text(eq['location'], style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.7))),
                            ],
                          ),
                        ),
                        Text(eq['status'].replaceAll('_', ' '), style: TextStyle(color: _getStatusColor(eq['status']), fontWeight: FontWeight.w600, fontSize: 12)),
                      ],
                    ),
                  )),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}