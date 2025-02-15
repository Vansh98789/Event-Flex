exports.registerUser = (req, res) => {
    const { name, walletAddress } = req.body;
    if (!name || !walletAddress) {
      return res.status(400).json({ error: "Missing user details" });
    }
    res.status(201).json({ message: "User registered successfully" });
  };
  
  exports.getUser = (req, res) => {
    res.json({ user: { id: req.params.id } });
  };
  