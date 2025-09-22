# Contributing to Apple Music Now Playing Firefox Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🤝 Ways to Contribute

- **Bug Reports** - Help us identify and fix issues
- **Feature Requests** - Suggest new functionality
- **Code Contributions** - Submit fixes and improvements
- **Documentation** - Improve README, comments, or examples
- **Testing** - Help test new features and edge cases

## 🐛 Reporting Bugs

Before submitting a bug report, please:

1. **Check existing issues** to avoid duplicates
2. **Test with latest version** from the main branch
3. **Provide detailed information**:
   - Firefox version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

### Bug Report Template
```markdown
**Firefox Version**: 
**Extension Version**: 
**OS**: 

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 

**Actual Behavior**: 

**Console Errors** (if any):
```

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. **Check existing feature requests** to avoid duplicates
2. **Describe the use case** - why would this be useful?
3. **Provide implementation ideas** if you have them
4. **Consider backward compatibility**

## 🔧 Development Setup

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature/fix
4. **Load extension** in Firefox via `about:debugging`
5. **Make changes** and test thoroughly
6. **Submit a pull request**

### Code Style

- Use **clear, descriptive variable names**
- Add **comments for complex logic**
- Follow existing **code patterns and structure**
- Test changes on **Apple Music with actual music playing**

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Track detection works on Apple Music
- [ ] WebSocket connections function properly
- [ ] File export works in all formats
- [ ] Settings persist across browser restarts
- [ ] No console errors during normal operation

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality (when applicable)
3. **Ensure compatibility** with Firefox 91+
4. **Follow commit message format**:
   ```
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   refactor: improve code structure
   ```

5. **Link related issues** in PR description

## 🚫 Code of Conduct

This project follows a simple code of conduct:

- **Be respectful** to all contributors
- **Focus on constructive feedback**
- **Help newcomers** get started
- **Keep discussions on-topic**

## 🎯 Priority Areas

Help is especially welcome in these areas:

- **Cross-browser compatibility** (Chrome extension port)
- **Performance optimizations**
- **Advanced WebSocket features**
- **Integration examples and tutorials**
- **Accessibility improvements**
- **Internationalization**

## 📧 Questions?

- **Open an issue** for technical questions
- **Check existing issues** for answered questions
- **Review the README** for setup instructions

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes for significant contributions
- GitHub contributor statistics

---

Thank you for helping make this project better! 🎵