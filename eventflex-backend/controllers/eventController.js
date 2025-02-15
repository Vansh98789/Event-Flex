exports.createEvent = (req, res) => {
    const { name, startTime, endTime } = req.body;
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing event details" });
    }
    res.status(201).json({ message: "Event created successfully" });
  };
  
  exports.getEvents = (req, res) => {
    res.json({ events: [] });
  };
  